import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useCreatorInfluencerRealtime } from "@/hooks/useCreatorInfluencerRealtime";
import type { 
  InfluencerTravelAuthorization, 
  PeriodType, 
  AuthorizationStatus, 
  ViaticosBreakdown,
  ExpeditionPaymentMethod 
} from "@/types/creatorInfluencer";
import {
  Sparkles, Calendar, Clock, DollarSign, MapPin, CheckCircle2,
  AlertCircle, Plus, Edit2, Trash2, Check, Copy, ExternalLink,
  ShieldCheck, ArrowRight, UserCheck, Flame, Car, Coffee,
  Fuel, Hotel, Navigation, Send, RefreshCw, X, Filter, Search,
  TrendingUp, Award, Layers
} from "lucide-react";

import { useBcvExchangeRate } from "@/hooks/useBcvExchangeRate";

const FUCSIA = "#FF0096";
const CIAN = "#00C8D4";
const PURPURA = "#9B00CC";

export default function AdminInfluencers() {
  const { bcvRate, formatBs } = useBcvExchangeRate();
  const { user, profile, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Hook centralizado con sincronización en tiempo real y almacenamiento local
  const {
    travelAuthorizations,
    expeditions,
    addTravelAuthorization,
    updateTravelAuthorization,
    toggleAuthorizationStatus,
    deleteTravelAuthorization,
    updateExpeditionPayment
  } = useCreatorInfluencerRealtime(1);

  // Estados de filtros y búsqueda
  const [activeTab, setActiveTab] = useState<"todos" | "dias" | "semanas" | "mes">("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedNotificationId, setCopiedNotificationId] = useState<string | null>(null);

  // Estados de modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAuth, setEditingAuth] = useState<InfluencerTravelAuthorization | null>(null);
  const [liquidatingAuth, setLiquidatingAuth] = useState<InfluencerTravelAuthorization | null>(null);

  // Estado del formulario de Asignación de Viajes
  const [formData, setFormData] = useState({
    influencer_id: 99901,
    influencer_name: "Aura Croce",
    influencer_handle: "@auracroce",
    period_type: "dias" as PeriodType,
    title: "",
    destination_target: "",
    assigned_month: "Octubre 2026",
    assigned_week: "Semana 42 (13 al 19 Octubre)",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 3 * 24 * 3600000).toISOString().split("T")[0],
    allowed_days_count: 4,
    authorized_trips_count: 1,
    fee_per_trip_usd: 20.00,
    viaticos: {
      combustible: 45,
      comidas: 35,
      hospedaje: 25,
      peajes: 5,
      guias_lancheros: 20,
      otros: 0
    } as ViaticosBreakdown,
    admin_notes: ""
  });

  // Estado de Liquidación
  const [liquidationForm, setLiquidationForm] = useState({
    payment_method: "pago_movil" as ExpeditionPaymentMethod,
    payment_reference: "",
    payment_date: new Date().toISOString().split("T")[0],
    notes: ""
  });

  // Validar permisos de Administrador
  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      setLocation("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading, setLocation]);

  // Cálculos de formulario
  const currentViaticosSum = (Number(formData.viaticos.combustible) || 0) +
    (Number(formData.viaticos.comidas) || 0) +
    (Number(formData.viaticos.hospedaje) || 0) +
    (Number(formData.viaticos.peajes) || 0) +
    (Number(formData.viaticos.guias_lancheros) || 0) +
    (Number(formData.viaticos.otros) || 0);

  const currentTotalHonorarios = (Number(formData.authorized_trips_count) || 1) * (Number(formData.fee_per_trip_usd) || 20);
  const currentTotalBudget = currentTotalHonorarios + currentViaticosSum;

  // KPIs Globales del Módulo Admin
  const totalAuthorizationsCount = travelAuthorizations.length;
  const activeAuthorizationsCount = travelAuthorizations.filter(a => a.status === "habilitado" || a.status === "en_curso").length;
  const totalAuthorizedTrips = travelAuthorizations.reduce((acc, a) => acc + (a.authorized_trips_count || 1), 0);
  const totalHonorariosUsd = travelAuthorizations.reduce((acc, a) => acc + (a.total_honorarios_usd || ((a.authorized_trips_count || 1) * 20)), 0);
  const totalViaticosBudgetUsd = travelAuthorizations.reduce((acc, a) => acc + (a.approved_viaticos_budget_usd || 0), 0);
  const totalGlobalBudgetUsd = totalHonorariosUsd + totalViaticosBudgetUsd;

  // Filtrado de autorizaciones
  const filteredAuthorizations = travelAuthorizations.filter(auth => {
    if (activeTab !== "todos" && auth.period_type !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = auth.title.toLowerCase().includes(q);
      const matchDest = auth.destination_target.toLowerCase().includes(q);
      const matchName = auth.influencer_name.toLowerCase().includes(q);
      const matchMonth = (auth.assigned_month || "").toLowerCase().includes(q);
      const matchWeek = (auth.assigned_week || "").toLowerCase().includes(q);
      if (!matchTitle && !matchDest && !matchName && !matchMonth && !matchWeek) return false;
    }
    return true;
  });

  // Abrir modal de creación
  const handleOpenCreate = () => {
    setEditingAuth(null);
    setFormData({
      influencer_id: 99901,
      influencer_name: "Aura Croce",
      influencer_handle: "@auracroce",
      period_type: "dias",
      title: "Ventana de Expedición - Días Habilitados",
      destination_target: "Ruta Playas & Posadas VIP",
      assigned_month: "Octubre 2026",
      assigned_week: "Semana 42 (13 al 19 Octubre)",
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(Date.now() + 3 * 24 * 3600000).toISOString().split("T")[0],
      allowed_days_count: 4,
      authorized_trips_count: 1,
      fee_per_trip_usd: 20.00,
      viaticos: {
        combustible: 45,
        comidas: 35,
        hospedaje: 25,
        peajes: 5,
        guias_lancheros: 20,
        otros: 0
      },
      admin_notes: "Habilitado por la administración central de Hoteles de Venezuela."
    });
    setShowCreateModal(true);
  };

  // Abrir modal de edición
  const handleOpenEdit = (auth: InfluencerTravelAuthorization) => {
    setEditingAuth(auth);
    setFormData({
      influencer_id: auth.influencer_id,
      influencer_name: auth.influencer_name,
      influencer_handle: auth.influencer_handle || "@auracroce",
      period_type: auth.period_type,
      title: auth.title,
      destination_target: auth.destination_target,
      assigned_month: auth.assigned_month || "Octubre 2026",
      assigned_week: auth.assigned_week || "Semana 42",
      start_date: auth.start_date,
      end_date: auth.end_date,
      allowed_days_count: auth.allowed_days_count,
      authorized_trips_count: auth.authorized_trips_count,
      fee_per_trip_usd: auth.fee_per_trip_usd || 20.00,
      viaticos: auth.viaticos_budget_breakdown || {
        combustible: auth.approved_viaticos_budget_usd ? auth.approved_viaticos_budget_usd * 0.4 : 40,
        comidas: auth.approved_viaticos_budget_usd ? auth.approved_viaticos_budget_usd * 0.3 : 30,
        hospedaje: auth.approved_viaticos_budget_usd ? auth.approved_viaticos_budget_usd * 0.2 : 20,
        peajes: 5,
        guias_lancheros: 15,
        otros: 0
      },
      admin_notes: auth.admin_notes || ""
    });
    setShowCreateModal(true);
  };

  // Guardar creación o edición
  const handleSaveAuthorization = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAuth) {
      updateTravelAuthorization(editingAuth.id, {
        title: formData.title,
        destination_target: formData.destination_target,
        period_type: formData.period_type,
        assigned_month: formData.assigned_month,
        assigned_week: formData.assigned_week,
        start_date: formData.start_date,
        end_date: formData.end_date,
        allowed_days_count: Number(formData.allowed_days_count),
        authorized_trips_count: Number(formData.authorized_trips_count),
        fee_per_trip_usd: Number(formData.fee_per_trip_usd),
        approved_viaticos_budget_usd: currentViaticosSum,
        viaticos_budget_breakdown: formData.viaticos,
        admin_notes: formData.admin_notes
      });
    } else {
      addTravelAuthorization({
        influencer_id: formData.influencer_id,
        influencer_name: formData.influencer_name,
        influencer_handle: formData.influencer_handle,
        period_type: formData.period_type,
        title: formData.title,
        destination_target: formData.destination_target,
        assigned_month: formData.assigned_month,
        assigned_week: formData.assigned_week,
        start_date: formData.start_date,
        end_date: formData.end_date,
        allowed_days_count: Number(formData.allowed_days_count),
        authorized_trips_count: Number(formData.authorized_trips_count),
        fee_per_trip_usd: Number(formData.fee_per_trip_usd),
        approved_viaticos_budget_usd: currentViaticosSum,
        viaticos_budget_breakdown: formData.viaticos,
        status: "habilitado",
        enabled_by_admin: true,
        admin_notes: formData.admin_notes
      });
    }

    setShowCreateModal(false);
    setEditingAuth(null);
  };

  // Generar y Copiar Mensaje de Notificación para WhatsApp
  const handleCopyWhatsAppNotice = (auth: InfluencerTravelAuthorization) => {
    const periodLabel = auth.period_type === "dias" 
      ? `🗓️ *DÍAS ASIGNADOS:* Del ${auth.start_date} al ${auth.end_date} (${auth.allowed_days_count} días)`
      : auth.period_type === "semanas"
      ? `📅 *SEMANA HABILITADA:* ${auth.assigned_week || "Semana"} (${auth.start_date} a ${auth.end_date})`
      : `📆 *MES ASIGNADO:* ${auth.assigned_month || "Mes"} (Cupo de ${auth.authorized_trips_count} viajes)`;

    const totalBudg = (auth.total_honorarios_usd || 20) + (auth.approved_viaticos_budget_usd || 0);
    const text = `🌴 *HOTELES DE VENEZUELA - AUTORIZACIÓN OFICIAL DE VIAJE* 🇻🇪\n` +
      `👤 *Creador(a):* ${auth.influencer_name} (${auth.influencer_handle || "@auracroce"})\n` +
      `📍 *Destino / Ruta:* ${auth.destination_target}\n` +
      `${periodLabel}\n\n` +
      `💵 *TASA OFICIAL BCV:* Bs. ${bcvRate.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / USD\n` +
      `💰 *HONORARIOS DE VIAJE:* $${(auth.fee_per_trip_usd || 20).toFixed(2)} USD (~Bs. ${formatBs(auth.fee_per_trip_usd || 20)})\n` +
      `⛽ *VIÁTICOS ASIGNADOS:* $${(auth.approved_viaticos_budget_usd || 0).toFixed(2)} USD (~Bs. ${formatBs(auth.approved_viaticos_budget_usd || 0)})\n` +
      `💵 *PRESUPUESTO TOTAL HABILITADO:* $${totalBudg.toFixed(2)} USD (~Bs. ${formatBs(totalBudg)} BCV)\n\n` +
      `✅ *Estado:* HABILITADO Y ACTIVO EN TU PANEL DE CREADOR\n` +
      `ℹ️ *Instrucciones:* Puedes registrar waypoints, auditorías de posadas y gastos de ruta directamente en tu panel: https://hotelesdevenezuela.com/mis-negocios\n\n` +
      `_Coordinación de Expediciones - Hoteles de Venezuela_`;

    navigator.clipboard.writeText(text);
    setCopiedNotificationId(auth.id);
    setTimeout(() => setCopiedNotificationId(null), 3500);
  };

  // Confirmar Liquidación Directa
  const handleConfirmLiquidation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liquidatingAuth) return;

    // Actualizar el estatus de la autorización a completado
    updateTravelAuthorization(liquidatingAuth.id, {
      status: "completado"
    });

    // Si coincide con alguna expedición, liquidarla también
    const matchingExp = expeditions.find(exp => 
      exp.destination.toLowerCase().includes(liquidatingAuth.destination_target.toLowerCase()) ||
      liquidatingAuth.destination_target.toLowerCase().includes(exp.destination.toLowerCase())
    );

    if (matchingExp) {
      updateExpeditionPayment(
        matchingExp.id,
        "liquidado",
        liquidationForm.payment_method,
        liquidationForm.payment_reference || `LIQ-${Date.now().toString().slice(-6)}`,
        liquidationForm.payment_date
      );
    }

    setLiquidatingAuth(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-16">
        
        {/* CABECERA PRINCIPAL CON ESTILO CORPORATIVO */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0e011f] via-[#1a0533] to-[#0e011f] p-8 border border-white/10 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#00C8D4]/20 via-[#FF0096]/20 to-transparent blur-3xl pointer-events-none rounded-full" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00C8D4]/15 border border-[#00C8D4]/30 text-[#00C8D4] text-xs font-bold tracking-widest uppercase mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                MÓDULO DE GESTIÓN CENTRAL DE INFLUENCERS & EXPEDICIONES
              </div>
              <h1 className="text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight">
                Asignación de Viajes, Días & Honorarios ($20/Viaje)
              </h1>
              <p className="text-slate-300 text-sm md:text-base mt-2 max-w-2xl">
                Habilita los días, semanas o meses que la influencer puede viajar. Asigna honorarios fijos de $20 USD por ruta, aprueba presupuestos de viáticos y sincroniza en tiempo real con su panel.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Botón Asistir Creador Directo */}
              <button
                onClick={() => setLocation("/mis-negocios?claim=aura-croce-viajera-creadora")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs md:text-sm font-semibold border border-white/20 transition backdrop-blur-md shadow-sm"
              >
                <UserCheck className="w-4 h-4 text-[#00C8D4]" />
                Asistir a Aura Croce
              </button>

              {/* Botón Nueva Asignación de Viaje */}
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:brightness-110 text-white text-xs md:text-sm font-bold shadow-lg shadow-[#FF0096]/25 transition transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Asignar Periodo de Viaje
              </button>
            </div>
          </div>
        </div>

        {/* TARJETAS DE KPIS FINANCIEROS Y OPERATIVOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Creador(a) Activa</span>
              <div className="w-8 h-8 rounded-lg bg-[#00C8D4]/10 flex items-center justify-center text-[#00C8D4]">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xl font-bold text-slate-900">Aura Croce</div>
              <div className="text-xs text-slate-700 mt-0.5">Tarifa base: $20.00 / viaje</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ventanas Activas</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-700">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900">{activeAuthorizationsCount} <span className="text-xs font-normal text-slate-700">/ {totalAuthorizationsCount} asignadas</span></div>
              <div className="text-xs text-emerald-700 font-medium mt-0.5">{totalAuthorizedTrips} viajes aprobados</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Total Honorarios</span>
              <div className="w-8 h-8 rounded-lg bg-[#FF0096]/10 flex items-center justify-center text-[#FF0096]">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-[#FF0096]">${totalHonorariosUsd.toFixed(2)} <span className="text-xs font-normal text-slate-700">USD</span></div>
              <div className="text-xs text-slate-700 mt-0.5">$20 USD por cada viaje</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Viáticos Aprobados</span>
              <div className="w-8 h-8 rounded-lg bg-[#9B00CC]/10 flex items-center justify-center text-[#9B00CC]">
                <Fuel className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-[#9B00CC]">${totalViaticosBudgetUsd.toFixed(2)} <span className="text-xs font-normal text-slate-700">USD</span></div>
              <div className="text-xs text-slate-700 mt-0.5">Combustible, comidas, posadas</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0e011f] to-[#1a0533] rounded-2xl p-5 border border-white/10 shadow-md flex flex-col justify-between text-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#00C8D4] uppercase tracking-wider">Presupuesto Global</span>
              <div className="w-8 h-8 rounded-lg bg-[#00C8D4]/20 flex items-center justify-center text-[#00C8D4]">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-white">${totalGlobalBudgetUsd.toFixed(2)} <span className="text-xs text-slate-300 font-normal">USD</span></div>
              <div className="text-xs text-slate-300 mt-0.5">~Bs. {formatBs(totalGlobalBudgetUsd)} BCV</div>
            </div>
          </div>

        </div>

        {/* PERFIL DE LA INFLUENCER OFICIAL */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                  alt="Aura Croce"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-[#FF0096] shadow-md"
                />
                <div className="absolute -bottom-2 -right-2 bg-emerald-700 text-white p-1 rounded-full border-2 border-white shadow">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">Aura Croce</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FF0096]/10 text-[#FF0096] border border-[#FF0096]/20">
                    Creadora Oficial HDV
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-mono mt-0.5">@auracroce • auracroce@gmail.com</p>
                <p className="text-xs text-slate-700 mt-1 max-w-xl">
                  Especialista en turismo de aventura 4x4, posadas con encanto y expediciones de costa a cordillera. Asignada para relevamiento fotográfico y auditorías en sitio.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => setLocation("/establecimiento/aura-croce-viajera-creadora")}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Ver Web App Pública
              </button>
              <button
                onClick={() => setLocation("/mis-negocios?claim=aura-croce-viajera-creadora")}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#00C8D4]/10 hover:bg-[#00C8D4]/20 text-[#008f99] text-xs font-bold transition border border-[#00C8D4]/30"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Ver Panel de Creador
              </button>
            </div>
          </div>
        </div>

        {/* CONTROLES, FILTROS Y BUSCADOR */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Pestañas de tipo de periodo */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80 overflow-x-auto">
            <button
              onClick={() => setActiveTab("todos")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === "todos"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Todas ({travelAuthorizations.length})
            </button>
            <button
              onClick={() => setActiveTab("dias")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === "dias"
                  ? "bg-[#00C8D4] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📅 Por Días Específicos
            </button>
            <button
              onClick={() => setActiveTab("semanas")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === "semanas"
                  ? "bg-[#FF0096] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🗓️ Por Semanas
            </button>
            <button
              onClick={() => setActiveTab("mes")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === "mes"
                  ? "bg-[#9B00CC] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📆 Por Mes Completo
            </button>
          </div>

          {/* Buscador */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              type="text"
              placeholder="Buscar por ruta, destino o mes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#00C8D4] bg-white"
            />
          </div>
        </div>

        {/* LISTADO DE ASIGNACIONES DE VIAJES / AUTORIZACIONES */}
        {filteredAuthorizations.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-600 mb-4">
              <Calendar className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-800">No hay periodos de viaje registrados con este filtro</h4>
            <p className="text-slate-700 text-xs max-w-md mx-auto mt-1">
              Crea una nueva asignación de viaje para habilitarle días, semanas o meses con honorarios de $20 USD y viáticos a la influencer.
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white text-xs font-bold shadow-md hover:brightness-110 transition"
            >
              <Plus className="w-4 h-4" />
              Asignar Primer Periodo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuthorizations.map((auth) => {
              const isEnabled = auth.status === "habilitado" || auth.status === "en_curso";
              const isPending = auth.status === "programado";
              const isCompleted = auth.status === "completado";
              const totalAuthBudget = (auth.total_honorarios_usd || 20) + (auth.approved_viaticos_budget_usd || 0);

              return (
                <div
                  key={auth.id}
                  className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md ${
                    isEnabled
                      ? "border-emerald-200 ring-1 ring-emerald-500/20"
                      : isCompleted
                      ? "border-slate-200 opacity-90"
                      : "border-amber-200 ring-1 ring-amber-500/20"
                  }`}
                >
                  {/* Encabezado de la Tarjeta */}
                  <div className="p-6 pb-4 border-b border-slate-100">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      {/* Badge de tipo de periodo */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          auth.period_type === "dias"
                            ? "bg-[#00C8D4]/15 text-[#008f99] border border-[#00C8D4]/30"
                            : auth.period_type === "semanas"
                            ? "bg-[#FF0096]/15 text-[#FF0096] border border-[#FF0096]/30"
                            : "bg-[#9B00CC]/15 text-[#9B00CC] border border-[#9B00CC]/30"
                        }`}
                      >
                        {auth.period_type === "dias" && "📅 Días Específicos"}
                        {auth.period_type === "semanas" && "🗓️ Semana Habilitada"}
                        {auth.period_type === "mes" && "📆 Mes Completo"}
                      </span>

                      {/* Estatus Switch / Badge */}
                      <button
                        onClick={() => toggleAuthorizationStatus(auth.id, isEnabled ? "pausado" : "habilitado")}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${
                          isEnabled
                            ? "bg-emerald-700 text-white shadow-sm hover:bg-emerald-800"
                            : isCompleted
                            ? "bg-blue-700 text-white"
                            : "bg-amber-700 text-white hover:bg-amber-800"
                        }`}
                        title="Click para alternar habilitación"
                      >
                        {isEnabled && <Check className="w-3 h-3" />}
                        {isEnabled ? "Habilitado" : isCompleted ? "Liquidado" : "Pausado / En Espera"}
                      </button>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                      {auth.title}
                    </h4>

                    <div className="flex items-center gap-1.5 text-xs text-slate-700 mt-2">
                      <MapPin className="w-3.5 h-3.5 text-[#FF0096] flex-shrink-0" />
                      <span className="truncate font-medium">{auth.destination_target}</span>
                    </div>

                    {/* Rango de Fechas / Días */}
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-600" />
                        <div>
                          <div className="font-bold text-slate-800">
                            {auth.period_type === "mes" && auth.assigned_month}
                            {auth.period_type === "semanas" && auth.assigned_week}
                            {auth.period_type === "dias" && `${auth.start_date} al ${auth.end_date}`}
                          </div>
                          <div className="text-[11px] text-slate-700">{auth.allowed_days_count} días autorizados</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-200/70 text-[11px] font-bold text-slate-700">
                        {auth.authorized_trips_count} {auth.authorized_trips_count === 1 ? "viaje" : "viajes"}
                      </span>
                    </div>
                  </div>

                  {/* Detalle Financiero: Honorarios ($20) + Viáticos */}
                  <div className="p-6 py-4 space-y-3 bg-slate-50/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-medium">Honorarios Base ({auth.authorized_trips_count} × $20):</span>
                      <span className="font-bold text-[#FF0096]">${(auth.total_honorarios_usd || 20).toFixed(2)} USD</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-medium">Viáticos Aprobados:</span>
                      <span className="font-bold text-[#9B00CC]">${(auth.approved_viaticos_budget_usd || 0).toFixed(2)} USD</span>
                    </div>

                    {auth.viaticos_budget_breakdown && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {Boolean(auth.viaticos_budget_breakdown.combustible) && (
                          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] text-slate-700">
                            ⛽ Comb: ${auth.viaticos_budget_breakdown.combustible}
                          </span>
                        )}
                        {Boolean(auth.viaticos_budget_breakdown.comidas) && (
                          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] text-slate-700">
                            ☕ Comidas: ${auth.viaticos_budget_breakdown.comidas}
                          </span>
                        )}
                        {Boolean(auth.viaticos_budget_breakdown.hospedaje) && (
                          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] text-slate-700">
                            🏨 Hospedaje: ${auth.viaticos_budget_breakdown.hospedaje}
                          </span>
                        )}
                        {Boolean(auth.viaticos_budget_breakdown.guias_lancheros) && (
                          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] text-slate-700">
                            🚤 Lanchas: ${auth.viaticos_budget_breakdown.guias_lancheros}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-700">Total Habilitado</div>
                        <div className="text-sm font-bold text-slate-900">${totalAuthBudget.toFixed(2)} USD</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-700">Equiv. BCV</div>
                        <div className="text-xs font-semibold text-emerald-700">
                          Bs. {formatBs(totalAuthBudget)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones de Tarjeta */}
                  <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleCopyWhatsAppNotice(auth)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition"
                      title="Copiar aviso para WhatsApp"
                    >
                      {copiedNotificationId === auth.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          ¡Copiado!
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          WhatsApp
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setLiquidatingAuth(auth)}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-[#00C8D4]/15 hover:text-[#008f99] text-slate-700 text-xs font-bold transition"
                      title="Liquidar o Registrar Pago"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleOpenEdit(auth)}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                      title="Editar asignación"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm("¿Estás seguro de eliminar este periodo de viaje asignado?")) {
                          deleteTravelAuthorization(auth.id);
                        }
                      }}
                      className="px-2.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition"
                      title="Eliminar asignación"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL DE CREACIÓN / EDICIÓN DE ASIGNACIÓN DE VIAJE */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 md:p-8">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF0096] to-[#9B00CC] flex items-center justify-center text-white shadow-md">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 font-serif">
                      {editingAuth ? "Editar Periodo de Viaje" : "Habilitar Nuevo Periodo de Viaje"}
                    </h3>
                    <p className="text-xs text-slate-700">
                      Asigna días, semanas o mes con honorarios ($20 USD/viaje) y viáticos
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveAuthorization} className="space-y-6 mt-6">
                
                {/* 1. SELECCIÓN DE INFLUENCER */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                      alt="Aura Croce"
                      className="w-10 h-10 rounded-xl object-cover border border-[#FF0096]"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Aura Croce (Creadora Oficial)</div>
                      <div className="text-[11px] text-slate-700 font-mono">@auracroce • Tarifa Base: $20.00 / viaje</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                    Activa
                  </span>
                </div>

                {/* 2. TIPO DE PERIODO (DÍAS, SEMANAS, MES) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Modalidad de Asignación de Tiempo *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, period_type: "dias" })}
                      className={`p-3 rounded-2xl border text-center transition ${
                        formData.period_type === "dias"
                          ? "bg-[#00C8D4]/10 border-[#00C8D4] text-[#008f99] font-bold shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div className="text-base mb-1">📅</div>
                      <div className="text-xs font-bold">Días Específicos</div>
                      <div className="text-[10px] text-slate-700 mt-0.5">Rango de fechas</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, period_type: "semanas" })}
                      className={`p-3 rounded-2xl border text-center transition ${
                        formData.period_type === "semanas"
                          ? "bg-[#FF0096]/10 border-[#FF0096] text-[#FF0096] font-bold shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div className="text-base mb-1">🗓️</div>
                      <div className="text-xs font-bold">Por Semana</div>
                      <div className="text-[10px] text-slate-700 mt-0.5">Semana del mes</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, period_type: "mes" })}
                      className={`p-3 rounded-2xl border text-center transition ${
                        formData.period_type === "mes"
                          ? "bg-[#9B00CC]/10 border-[#9B00CC] text-[#9B00CC] font-bold shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div className="text-base mb-1">📆</div>
                      <div className="text-xs font-bold">Mes Completo</div>
                      <div className="text-[10px] text-slate-700 mt-0.5">Cupo mensual</div>
                    </button>
                  </div>
                </div>

                {/* 3. TÍTULO Y DESTINO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Título de la Asignación *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ej: Ventana Morrocoy & Cayos"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#00C8D4] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Destino / Región Asignada *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.destination_target}
                      onChange={(e) => setFormData({ ...formData, destination_target: e.target.value })}
                      placeholder="Ej: Mochima, Sucre / Chichiriviche"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#00C8D4] focus:outline-none"
                    />
                  </div>
                </div>

                {/* 4. CONFIGURACIÓN SEGÚN MODALIDAD */}
                {formData.period_type === "dias" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Fecha de Inicio</label>
                      <input
                        type="date"
                        required
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Fecha Fin</label>
                      <input
                        type="date"
                        required
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Días Habilitados</label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={formData.allowed_days_count}
                        onChange={(e) => setFormData({ ...formData, allowed_days_count: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                      />
                    </div>
                  </div>
                )}

                {formData.period_type === "semanas" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Identificador de Semana</label>
                      <input
                        type="text"
                        value={formData.assigned_week}
                        onChange={(e) => setFormData({ ...formData, assigned_week: e.target.value })}
                        placeholder="Ej: Semana 43 (20 al 26 Octubre)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Días de la Semana</label>
                      <input
                        type="number"
                        value={formData.allowed_days_count}
                        onChange={(e) => setFormData({ ...formData, allowed_days_count: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                      />
                    </div>
                  </div>
                )}

                {formData.period_type === "mes" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Mes Asignado</label>
                      <input
                        type="text"
                        value={formData.assigned_month}
                        onChange={(e) => setFormData({ ...formData, assigned_month: e.target.value })}
                        placeholder="Ej: Noviembre 2026"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Cupo de Días en el Mes</label>
                      <input
                        type="number"
                        value={formData.allowed_days_count}
                        onChange={(e) => setFormData({ ...formData, allowed_days_count: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* 5. HONORARIOS BASE ($20 USD / VIAJE) */}
                <div className="p-4 bg-gradient-to-r from-[#FF0096]/10 to-[#9B00CC]/10 rounded-2xl border border-[#FF0096]/20">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-xs font-bold text-[#FF0096] uppercase tracking-wider">Honorarios de Viaje</span>
                      <p className="text-[11px] text-slate-700">Remuneración fija garantizada por cada ruta autorizada</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#FF0096] text-white text-xs font-bold shadow-sm">
                      $20.00 USD / Viaje
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Viajes Autorizados en el Periodo</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.authorized_trips_count}
                        onChange={(e) => setFormData({ ...formData, authorized_trips_count: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Total Honorarios ($20 × N)</label>
                      <input
                        type="text"
                        disabled
                        value={`$${currentTotalHonorarios.toFixed(2)} USD`}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-100 font-bold text-[#FF0096]"
                      />
                    </div>
                  </div>
                </div>

                {/* 6. PRESUPUESTO DE VIÁTICOS */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Presupuesto de Viáticos Aprobado ($ USD)
                    </label>
                    <span className="text-xs font-bold text-[#9B00CC]">
                      Suma: ${currentViaticosSum.toFixed(2)} USD
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">⛽ Combustible ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.viaticos.combustible}
                        onChange={(e) => setFormData({
                          ...formData,
                          viaticos: { ...formData.viaticos, combustible: Number(e.target.value) }
                        })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">☕ Comidas ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.viaticos.comidas}
                        onChange={(e) => setFormData({
                          ...formData,
                          viaticos: { ...formData.viaticos, comidas: Number(e.target.value) }
                        })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">🏨 Hospedaje ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.viaticos.hospedaje}
                        onChange={(e) => setFormData({
                          ...formData,
                          viaticos: { ...formData.viaticos, hospedaje: Number(e.target.value) }
                        })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">🛣️ Peajes ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.viaticos.peajes}
                        onChange={(e) => setFormData({
                          ...formData,
                          viaticos: { ...formData.viaticos, peajes: Number(e.target.value) }
                        })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">🚤 Lanchas/Guías ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.viaticos.guias_lancheros}
                        onChange={(e) => setFormData({
                          ...formData,
                          viaticos: { ...formData.viaticos, guias_lancheros: Number(e.target.value) }
                        })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">📦 Otros ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.viaticos.otros}
                        onChange={(e) => setFormData({
                          ...formData,
                          viaticos: { ...formData.viaticos, otros: Number(e.target.value) }
                        })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 7. RESUMEN GLOBAL TOTAL */}
                <div className="p-4 bg-slate-900 rounded-2xl text-white flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Total Habilitado (Honorarios + Viáticos)</span>
                    <div className="text-xl font-bold text-[#00C8D4]">
                      ${currentTotalBudget.toFixed(2)} USD
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Tasa Oficial BCV ({bcvRate.toLocaleString("es-VE", { minimumFractionDigits: 2 })} Bs/$)</span>
                    <div className="text-sm font-semibold text-emerald-400">
                      Bs. {formatBs(currentTotalBudget)}
                    </div>
                  </div>
                </div>

                {/* NOTAS */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Instrucciones / Notas para la Influencer
                  </label>
                  <textarea
                    rows={2}
                    value={formData.admin_notes}
                    onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                    placeholder="Instrucciones sobre auditorías a posadas, cobertura en redes o entregables..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#00C8D4] focus:outline-none"
                  />
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-[#FF0096]/20 transition"
                  >
                    {editingAuth ? "Guardar Cambios" : "Habilitar Periodo de Viaje"}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

        {/* MODAL DE LIQUIDACIÓN DE PAGOS */}
        {liquidatingAuth && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 p-6 md:p-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-serif">Registrar Liquidación de Viaje</h3>
                    <p className="text-xs text-slate-700">{liquidatingAuth.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setLiquidatingAuth(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleConfirmLiquidation} className="space-y-4 mt-5">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700">Honorarios ({liquidatingAuth.authorized_trips_count} viajes):</span>
                    <span className="font-bold text-[#FF0096]">${(liquidatingAuth.total_honorarios_usd || 20).toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700">Viáticos:</span>
                    <span className="font-bold text-[#9B00CC]">${(liquidatingAuth.approved_viaticos_budget_usd || 0).toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold pt-2 border-t border-slate-200 text-slate-900">
                    <span>Monto Total a Liquidar:</span>
                    <span className="text-emerald-700">
                      ${((liquidatingAuth.total_honorarios_usd || 20) + (liquidatingAuth.approved_viaticos_budget_usd || 0)).toFixed(2)} USD
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Método de Pago</label>
                  <select
                    value={liquidationForm.payment_method}
                    onChange={(e) => setLiquidationForm({ ...liquidationForm, payment_method: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="pago_movil">Pago Móvil (Bancaribe / Banesco / Venezuela)</option>
                    <option value="zelle">Zelle (USD)</option>
                    <option value="transferencia">Transferencia Bancaria Nacional</option>
                    <option value="efectivo">Efectivo (Dólares Cash en Físico)</option>
                    <option value="binance_usdt">Binance Pay (USDT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Referencia Bancaria / Comprobante</label>
                  <input
                    type="text"
                    required
                    value={liquidationForm.payment_reference}
                    onChange={(e) => setLiquidationForm({ ...liquidationForm, payment_reference: e.target.value })}
                    placeholder="Ej: REF-9844210 / ZELLE-AURA"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Fecha de Pago</label>
                  <input
                    type="date"
                    required
                    value={liquidationForm.payment_date}
                    onChange={(e) => setLiquidationForm({ ...liquidationForm, payment_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setLiquidatingAuth(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition"
                  >
                    Confirmar y Marcar Liquidado
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
