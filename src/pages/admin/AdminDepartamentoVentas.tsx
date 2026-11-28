import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  DollarSign,
  Edit3,
  ExternalLink,
  FileText,
  Filter,
  Link2,
  Lock,
  MapPin,
  Phone,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  X
} from "lucide-react";
import { ESTABLISHMENTS_MOCK } from "@/lib/establishmentsMock";
import {
  buildPreloadedClientReviewUrl,
  createOrUpdatePreloadedInvitation,
  ensureWakuLodgePreloadedInvitation,
  getSalesCounters,
  getSalesReceipts,
  MAX_FOUNDERS_QUOTA,
  resetAllSalesAndFinanceCountersToZero,
  syncSalesStateFromSupabase,
  updateReceiptFinancialStatus,
  updateSalesPreRegistrationReceipt,
  type FinancialStatus,
  type MembershipModality,
  type SalesCountersState,
  type SalesPreRegistrationReceipt
} from "@/lib/salesDepartmentStore";
import { UNIFIED_PLATFORM_CATEGORIES } from "@/pages/PreRegistro";
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

  // Estados del Modal de Edición Rápida (No destructiva)
  const [editingReceipt, setEditingReceipt] = useState<SalesPreRegistrationReceipt | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDestination, setEditDestination] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editRegistrant, setEditRegistrant] = useState("");
  const [editModality, setEditModality] = useState<MembershipModality>("fundadores_50");
  const [editNotes, setEditNotes] = useState("");
  const [editPrimaryImage, setEditPrimaryImage] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // =========================================================================
  // GENERADOR UNIVERSAL DE PRE-REGISTRO PRECARGADO (MODO CLARO EJECUTIVO HDV)
  // =========================================================================
  const [selectedDirectorySlug, setSelectedDirectorySlug] = useState<string>("waku-lodge-canaima");
  const [preloadTitle, setPreloadTitle] = useState<string>("Wakü Lodge Canaima");
  const [preloadSlug, setPreloadSlug] = useState<string>("waku-lodge-canaima");
  const [preloadCategory, setPreloadCategory] = useState<string>("Campamento / Eco-Lodge");
  const [preloadDestination, setPreloadDestination] = useState<string>("Canaima");
  const [preloadCity, setPreloadCity] = useState<string>("Laguna de Canaima");
  const [preloadState, setPreloadState] = useState<string>("Bolívar");
  const [preloadWhatsapp, setPreloadWhatsapp] = useState<string>("+58 414 8882233");
  const [preloadContactPerson, setPreloadContactPerson] = useState<string>("Lusbelys Castro");
  const [preloadWebsite, setPreloadWebsite] = useState<string>("https://wakulodge.com");
  const [preloadEmail, setPreloadEmail] = useState<string>("");
  const [preloadDescription, setPreloadDescription] = useState<string>(
    "Campamento y resort ecológico de ultra-lujo frente a la mítica Laguna de Canaima con vistas directas a los saltos y tepuyes."
  );
  const [preloadPrimaryImage, setPreloadPrimaryImage] = useState<string>(
    "https://images.unsplash.com/photo-1586375300773-8384e3e4916f?w=800&auto=format&fit=crop"
  );
  const [preloadLatitude, setPreloadLatitude] = useState<string>("6.244200");
  const [preloadLongitude, setPreloadLongitude] = useState<string>("-62.852900");
  const [preloadBenefitLevel, setPreloadBenefitLevel] = useState<
    "prestigio_top50" | "estandar_connect"
  >("prestigio_top50");
  const [isGeneratingPreload, setIsGeneratingPreload] = useState<boolean>(false);
  const [generatedPreloadReceipt, setGeneratedPreloadReceipt] =
    useState<SalesPreRegistrationReceipt | null>(null);
  const [copiedLinkFolio, setCopiedLinkFolio] = useState<string | null>(null);

  const handleSelectDirectoryEstablishment = (slugVal: string) => {
    setSelectedDirectorySlug(slugVal);
    if (slugVal === "__custom__") {
      setPreloadTitle("");
      setPreloadSlug("");
      setPreloadDestination("");
      setPreloadCity("");
      setPreloadState("");
      setPreloadWhatsapp("");
      setPreloadContactPerson("");
      setPreloadWebsite("");
      setPreloadEmail("");
      setPreloadDescription("");
      setPreloadLatitude("");
      setPreloadLongitude("");
      return;
    }

    const found = ESTABLISHMENTS_MOCK.find((item) => item.slug === slugVal);
    if (!found) return;

    setPreloadTitle(found.name || "");
    setPreloadSlug(found.slug || "");
    setPreloadCategory(
      found.slug === "waku-lodge-canaima"
        ? "Campamento / Eco-Lodge"
        : found.category_name || "Posada Boutique"
    );
    setPreloadDestination(found.destination_name || "");
    const addrParts = (found.address || "").split(",").map((s) => s.trim()).filter(Boolean);
    setPreloadCity(addrParts[0] || found.destination_name || "");
    setPreloadState(addrParts[addrParts.length - 1] || found.destination_name || "");
    setPreloadWhatsapp(found.whatsapp || found.phone || "");
    setPreloadContactPerson(found.slug === "waku-lodge-canaima" ? "Lusbelys Castro" : "");
    setPreloadWebsite(found.website || "");
    setPreloadEmail(found.email || "");
    setPreloadDescription(found.description || "");
    setPreloadPrimaryImage(found.primary_image || "");
    setPreloadLatitude(found.slug === "waku-lodge-canaima" ? "6.244200" : "");
    setPreloadLongitude(found.slug === "waku-lodge-canaima" ? "-62.852900" : "");
  };

  const handleGeneratePreloadedLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preloadTitle.trim()) return;
    setIsGeneratingPreload(true);
    try {
      const autoSlug =
        preloadSlug.trim() ||
        preloadTitle
          .toLowerCase()
          .trim()
          .replace(/[\s\W-]+/g, "-")
          .replace(/^-+|-+$/g, "");

      const receipt = await createOrUpdatePreloadedInvitation({
        establishmentTitle: preloadTitle.trim(),
        establishmentSlug: autoSlug,
        categoryName: preloadCategory.trim() || "Posada Boutique",
        destinationName: preloadDestination.trim() || "Venezuela",
        state: preloadState.trim() || preloadDestination.trim(),
        city: preloadCity.trim() || preloadDestination.trim(),
        whatsappNumber: preloadWhatsapp.trim(),
        officialEmail: preloadEmail.trim(),
        officialWebsite: preloadWebsite.trim(),
        shortDescription: preloadDescription.trim(),
        primaryImage: preloadPrimaryImage.trim(),
        galleryImages: preloadPrimaryImage.trim() ? [preloadPrimaryImage.trim()] : [],
        latitude: preloadLatitude.trim(),
        longitude: preloadLongitude.trim(),
        contactPersonName: preloadContactPerson.trim() || "Gerencia General",
        benefitLevel: preloadBenefitLevel,
        modality:
          preloadBenefitLevel === "estandar_connect"
            ? "comercial_estandar"
            : "exclusivo_prestigio",
        createdByEmail: user?.email || "operaciones@hotelesdevenezuela.com",
        createdByUserId: user?.id || null
      });

      setGeneratedPreloadReceipt(receipt);
      setCounters(getSalesCounters());
      setReceipts(getSalesReceipts());
    } finally {
      setIsGeneratingPreload(false);
    }
  };

  const handleCopyClientReviewUrl = async (receipt: SalesPreRegistrationReceipt) => {
    const url = buildPreloadedClientReviewUrl({
      folio: receipt.folio,
      establishmentSlug: receipt.establishmentSlug,
      contactPersonName:
        receipt.contactPersonName ||
        receipt.registrantName.replace(/^Propietario \/ Gerente:\s*/i, ""),
      modality: receipt.modality
    });
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLinkFolio(receipt.folio);
      setTimeout(() => setCopiedLinkFolio(null), 3500);
    } catch {
      window.prompt("Copia el enlace oficial de revisión para el cliente:", url);
    }
  };

  const openEditModal = (r: SalesPreRegistrationReceipt) => {
    setEditingReceipt(r);
    setEditTitle(r.establishmentTitle || "");
    setEditCategory(r.categoryName || "Posada Boutique");
    setEditDestination(r.destinationName || "");
    setEditCity(r.city || "");
    setEditState(r.state || "");
    setEditWhatsapp(r.whatsappNumber || "");
    setEditRegistrant(r.registrantName || "");
    setEditModality(r.modality || "fundadores_50");
    setEditNotes(r.notes || "");
    setEditPrimaryImage(r.primaryImage || "");
  };

  const handleSaveEditedReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReceipt || !editTitle.trim()) return;
    setIsSavingEdit(true);
    try {
      const updated = await updateSalesPreRegistrationReceipt({
        folio: editingReceipt.folio,
        establishmentTitle: editTitle.trim(),
        categoryName: editCategory.trim(),
        destinationName: editDestination.trim(),
        city: editCity.trim(),
        state: editState.trim(),
        whatsappNumber: editWhatsapp.trim(),
        registrantName: editRegistrant.trim(),
        modality: editModality,
        notes: editNotes.trim(),
        primaryImage: editPrimaryImage.trim(),
        updatedByEmail: user?.email || "admin@hotelesdevenezuela.com",
        updatedByUserId: user?.id || null
      });
      setReceipts(getSalesReceipts());
      if (updated && selectedReceipt?.folio === updated.folio) {
        setSelectedReceipt(updated);
      }
      setEditingReceipt(null);
    } finally {
      setIsSavingEdit(false);
    }
  };

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
    // Asegurar que la invitación precargada del primer caso de prueba (Wakü Lodge — Lusbelys Castro) esté lista
    const wakuReceipt = await ensureWakuLodgePreloadedInvitation();
    setGeneratedPreloadReceipt((prev) => prev || wakuReceipt);
    setCounters(getSalesCounters());
    setReceipts(getSalesReceipts());
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

  const confirmedReceiptsOnly = receipts.filter(
    (r) => r.invitationStatus !== "precargado_pendiente" && r.termsAccepted !== false
  );
  const foundersCount = confirmedReceiptsOnly.filter(
    (r) => r.modality === "fundadores_50" && (r.founderSlotNumber !== null || r.financialStatus === "exonerado")
  ).length;
  const prestigioCount = confirmedReceiptsOnly.filter(
    (r) => r.modality === "exclusivo_prestigio" && (r.founderSlotNumber !== null || r.financialStatus === "exonerado")
  ).length;
  const foundersOccupied = Math.min(
    MAX_FOUNDERS_QUOTA,
    confirmedReceiptsOnly.length > 0 ? foundersCount + prestigioCount : counters.foundersCounter
  );
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
              title="Sincronizar historial completo desde Supabase sin pérdida de datos"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Sincronizar Historial</span>
            </button>

            <span className="px-3.5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/35 text-emerald-300 text-[11px] font-black flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Historial Protegido (Anti-Borrado)</span>
            </span>

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
        {/* Barra de Progreso Oficial: Cupo Global Unificado 50 Exoneraciones (Fundadores + Prestigio) */}
        <div className="rounded-3xl bg-gradient-to-br from-[#0e011f] to-[#1a0533] text-white p-6 sm:p-7 border border-[#00C8D4]/30 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FF0096] text-white flex items-center justify-center shrink-0 shadow-lg">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00C8D4] block">
                  Contador Global Unificado • Alianza 50 Fundadores + Prestigio 2026
                </span>
                <h2
                  className="text-xl sm:text-2xl font-bold text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Cupos de Exoneración: {foundersOccupied} / {MAX_FOUNDERS_QUOTA} Ocupados · {foundersRemaining} Disponibles
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FF0096]/25 border border-[#FF0096]/50 text-pink-200 text-[10px] font-black uppercase">
                    Alianza 50 Fundadores: {foundersCount}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#9B00CC]/30 border border-[#9B00CC]/60 text-purple-200 text-[10px] font-black uppercase">
                    Prestigio / Exclusivos: {prestigioCount}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#00C8D4]/20 border border-[#00C8D4]/45 text-[#00C8D4] text-[10px] font-black uppercase">
                    Próximo Cupo Correlativo: #{Math.min(MAX_FOUNDERS_QUOTA, foundersOccupied + 1)} / {MAX_FOUNDERS_QUOTA}
                  </span>
                </div>
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

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold text-slate-300 mt-2">
            <span>Desglose activo: {foundersCount} Fundadores + {prestigioCount} Prestigio</span>
            <span>Progreso unificado: {foundersPct}% ({foundersOccupied} / {MAX_FOUNDERS_QUOTA} ocupados)</span>
            <span>Meta Global 50 Cupos (Activación Facturación HDV-FAC)</span>
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

          {/* 2. Cupos Utilizados Global 50 (Fundadores + Prestigio) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF0096] text-white flex items-center justify-center shrink-0 shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Cupo Unificado 50 (Fund. + Prest.)
              </span>
              <p className="text-2xl font-black text-slate-900 font-mono">
                {foundersOccupied} <span className="text-sm text-slate-400">/ {MAX_FOUNDERS_QUOTA}</span>
              </p>
              <span className="text-[11px] font-bold text-[#FF0096] block">
                {foundersCount} Fundadores · {prestigioCount} Prestigio ({foundersRemaining} disp.)
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

        {/* ========================================================================
            GENERADOR UNIVERSAL DE PRE-REGISTRO PRECARGADO (MODO CLARO EJECUTIVO HDV)
        ======================================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#00C8D4]/40 shadow-md space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#00C8D4] text-white flex items-center justify-center shrink-0 shadow-md">
                <Link2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#00C8D4]/15 text-[#008f99] border border-[#00C8D4]/30 text-[10px] font-black uppercase tracking-wider">
                    Módulo Comercial / Operaciones • Expediciones B2B
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                    0% Datos Inventados • Validación en 1 Clic
                  </span>
                </div>
                <h2
                  className="text-xl sm:text-2xl font-black text-slate-900"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Generador Universal de Pre-Registro Precargado
                </h2>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                  Genera un enlace único de revisión y activación (<code>?folio=HDV-PR-2026-...</code>) para cualquier establecimiento del directorio o prospecto visitado en expedición. Toma únicamente los datos reales verificados y deja en blanco habitaciones, tarifas o etiquetas no confirmadas.
                </p>
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-right shrink-0">
              <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                Cupo Unificado Top 50
              </span>
              <span className="text-sm font-mono font-black text-slate-900">
                {foundersOccupied} / {MAX_FOUNDERS_QUOTA} Asignados ({foundersRemaining} disponibles)
              </span>
            </div>
          </div>

          <form onSubmit={handleGeneratePreloadedLink} className="space-y-5">
            {/* Fila 1: Selector de Establecimiento del Directorio & Nivel de Beneficio */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-6">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1.5">
                  1. Seleccionar Establecimiento del Directorio o Prospecto B2B
                </label>
                <select
                  value={selectedDirectorySlug}
                  onChange={(e) => handleSelectDirectoryEstablishment(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-slate-200 focus:border-[#00C8D4] text-xs font-black text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="waku-lodge-canaima">
                    ★ Wakü Lodge Canaima (Canaima, Bolívar — Contacto: Lusbelys Castro)
                  </option>
                  {ESTABLISHMENTS_MOCK.filter((item) => item.slug !== "waku-lodge-canaima").map(
                    (est) => (
                      <option key={est.slug} value={est.slug}>
                        {est.name} ({est.destination_name} — {est.category_name})
                      </option>
                    )
                  )}
                  <option value="__custom__">
                    + Ingresar Nuevo Prospecto B2B / Establecimiento de Expedición
                  </option>
                </select>
              </div>

              <div className="lg:col-span-6">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1.5">
                  2. Nivel de Beneficio Asignado Antes de Generar el Enlace *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPreloadBenefitLevel("prestigio_top50")}
                    className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-2.5 ${preloadBenefitLevel === "prestigio_top50"
                        ? "bg-white border-[#FF0096] ring-2 ring-[#FF0096]/15 shadow-sm"
                        : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#FF0096] text-white flex items-center justify-center shrink-0">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="block text-xs font-black text-slate-900">
                        Cliente de Prestigio / Top 50
                      </span>
                      <span className="text-[10px] font-bold text-[#FF0096] block">
                        Exoneración Activa ($0.00) • 0% Comisiones
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreloadBenefitLevel("estandar_connect")}
                    className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-2.5 ${preloadBenefitLevel === "estandar_connect"
                        ? "bg-white border-[#00C8D4] ring-2 ring-[#00C8D4]/20 shadow-sm"
                        : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#00C8D4] text-white flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="block text-xs font-black text-slate-900">
                        Plan Estándar / HDV Connect
                      </span>
                      <span className="text-[10px] font-bold text-[#008f99] block">
                        Trato Directo • 0% Comisiones
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Fila 2: Datos Reales Verificados que se Precargan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Nombre Oficial del Establecimiento *
                </label>
                <input
                  type="text"
                  required
                  value={preloadTitle}
                  onChange={(e) => setPreloadTitle(e.target.value)}
                  placeholder="Ej. Wakü Lodge Canaima"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Responsable / Contacto Directo *
                </label>
                <input
                  type="text"
                  required
                  value={preloadContactPerson}
                  onChange={(e) => setPreloadContactPerson(e.target.value)}
                  placeholder="Ej. Lusbelys Castro"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Categoría Verificada
                </label>
                <select
                  value={preloadCategory}
                  onChange={(e) => setPreloadCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4] cursor-pointer"
                >
                  {!UNIFIED_PLATFORM_CATEGORIES.some(
                    (c) => c.label.toLowerCase() === preloadCategory.toLowerCase()
                  ) && <option value={preloadCategory}>{preloadCategory}</option>}
                  {UNIFIED_PLATFORM_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.label}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  WhatsApp Oficial Verificado *
                </label>
                <input
                  type="text"
                  required
                  value={preloadWhatsapp}
                  onChange={(e) => setPreloadWhatsapp(e.target.value)}
                  placeholder="+58 414 8882233"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Destino Turístico
                </label>
                <input
                  type="text"
                  value={preloadDestination}
                  onChange={(e) => setPreloadDestination(e.target.value)}
                  placeholder="Ej. Canaima"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Ciudad / Sector & Estado
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={preloadCity}
                    onChange={(e) => setPreloadCity(e.target.value)}
                    placeholder="Ciudad/Sector"
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                  />
                  <input
                    type="text"
                    value={preloadState}
                    onChange={(e) => setPreloadState(e.target.value)}
                    placeholder="Estado"
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Sitio Web / Instagram Real
                </label>
                <input
                  type="text"
                  value={preloadWebsite}
                  onChange={(e) => setPreloadWebsite(e.target.value)}
                  placeholder="https://wakulodge.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Coordenadas GPS (Lat / Lng)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={preloadLatitude}
                    onChange={(e) => setPreloadLatitude(e.target.value)}
                    placeholder="Latitud"
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                  />
                  <input
                    type="text"
                    value={preloadLongitude}
                    onChange={(e) => setPreloadLongitude(e.target.value)}
                    placeholder="Longitud"
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
              <p className="text-[11px] text-slate-600 font-semibold">
                Regla activa:{" "}
                <strong className="text-slate-900">
                  0 habitaciones genéricas • 0 etiquetas no confirmadas
                </strong>
                . El cliente podrá revisar, editar o cargar sus habitaciones reales y aceptar términos con 1 clic.
              </p>

              <button
                type="submit"
                disabled={isGeneratingPreload}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:opacity-95 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer shrink-0 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isGeneratingPreload
                    ? "Generando Enlace..."
                    : "Generar / Actualizar Enlace Precargado"}
                </span>
              </button>
            </div>
          </form>

          {/* Recuadro de Enlace Directo Listo para Enviar al Cliente */}
          {generatedPreloadReceipt && (
            <div className="p-5 rounded-2xl bg-cyan-50/60 border-2 border-[#00C8D4] space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#0e011f] text-white font-mono text-[11px] font-black">
                      Folio: {generatedPreloadReceipt.folio}
                    </span>
                    {generatedPreloadReceipt.founderSlotNumber && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#FF0096] text-white text-[10px] font-black uppercase">
                        Cupo Prestigio / Top 50: #{generatedPreloadReceipt.founderSlotNumber} /{" "}
                        {MAX_FOUNDERS_QUOTA} (Exonerado $0.00)
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-[10px] font-black">
                      Contacto:{" "}
                      {generatedPreloadReceipt.contactPersonName ||
                        generatedPreloadReceipt.registrantName}
                    </span>
                  </div>
                  <p className="text-xs font-black text-slate-900">
                    Enlace Único de Revisión y Validación Oficial para{" "}
                    <span className="text-[#9B00CC]">
                      {generatedPreloadReceipt.establishmentTitle}
                    </span>
                    :
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyClientReviewUrl(generatedPreloadReceipt)}
                    className="px-4 py-2 rounded-xl bg-[#00C8D4] hover:bg-[#00b2bd] text-slate-950 text-xs font-black inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>
                      {copiedLinkFolio === generatedPreloadReceipt.folio
                        ? "¡Enlace Copiado!"
                        : "Copiar Enlace para Cliente"}
                    </span>
                  </button>

                  <a
                    href={buildPreloadedClientReviewUrl(
                      {
                        folio: generatedPreloadReceipt.folio,
                        establishmentSlug: generatedPreloadReceipt.establishmentSlug,
                        contactPersonName: generatedPreloadReceipt.contactPersonName,
                        modality: generatedPreloadReceipt.modality
                      },
                      ""
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 text-xs font-black inline-flex items-center gap-1.5 shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#FF0096]" />
                    <span>Abrir Vista del Cliente</span>
                  </a>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 font-mono text-xs font-bold text-slate-800 break-all select-all">
                {buildPreloadedClientReviewUrl({
                  folio: generatedPreloadReceipt.folio,
                  establishmentSlug: generatedPreloadReceipt.establishmentSlug,
                  contactPersonName: generatedPreloadReceipt.contactPersonName,
                  modality: generatedPreloadReceipt.modality
                })}
              </div>
            </div>
          )}
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
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ${r.modality === "fundadores_50"
                              ? "bg-pink-100 text-pink-700"
                              : r.modality === "exclusivo_prestigio"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-cyan-100 text-cyan-800"
                            }`}
                        >
                          {r.modalityLabel}
                        </span>
                        {r.founderSlotNumber && (
                          <span
                            className={`block text-[10px] font-extrabold mt-1 ${r.modality === "exclusivo_prestigio" ? "text-[#9B00CC]" : "text-[#FF0096]"
                              }`}
                          >
                            Cupo #{r.founderSlotNumber} / {MAX_FOUNDERS_QUOTA} (
                            {r.modality === "exclusivo_prestigio" ? "Prestigio 2026" : "Fundador"})
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-bold text-slate-800 block">{r.registrantName}</span>
                        {r.termsAccepted !== false && r.invitationStatus !== "precargado_pendiente" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold mt-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Términos y Derechos de Imagen Aceptados</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>Precargado • Listo para validar por el cliente</span>
                          </span>
                        )}
                        {r.notes && (
                          <span className="block text-[10px] text-slate-500 font-medium mt-0.5 truncate max-w-[220px]" title={r.notes}>
                            Nota: {r.notes}
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
                        {r.updatedAtFormatted && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 text-[9px] font-black uppercase">
                            Editado: {r.updatedAtFormatted}
                          </span>
                        )}
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
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black ${r.financialStatus === "pagado"
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
                        <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                          {/* 0. Copiar Enlace Único de Revisión del Cliente (?folio=HDV-PR-2026-...) */}
                          <button
                            type="button"
                            onClick={() => handleCopyClientReviewUrl(r)}
                            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-cyan-50 text-slate-900 border-2 border-[#00C8D4] text-[10px] font-black inline-flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                            title="Copiar enlace directo de Revisión y Validación para el propietario/gerente"
                          >
                            <Link2 className="w-3.5 h-3.5 text-[#008f99]" />
                            <span>
                              {copiedLinkFolio === r.folio ? "¡Copiado!" : "Enlace Cliente"}
                            </span>
                          </button>

                          {/* 1. Ver QR (Turquesa Cian #00C8D4) */}
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(r)}
                            className="px-2.5 py-1.5 rounded-xl bg-[#00C8D4] hover:bg-[#00b2bd] text-slate-950 text-[10px] font-black inline-flex items-center gap-1 shadow-sm hover:shadow transition-all cursor-pointer"
                            title="Ver Credencial / Comprobante con Código QR"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Ver QR</span>
                          </button>

                          {/* 2. Editar Registro Operativo (Magenta / Púrpura #FF0096) */}
                          <button
                            type="button"
                            onClick={() => openEditModal(r)}
                            className="px-2.5 py-1.5 rounded-xl bg-[#FF0096] hover:bg-[#e00083] text-white text-[10px] font-black inline-flex items-center gap-1 shadow-sm hover:shadow transition-all cursor-pointer"
                            title="Editar datos operativos del pre-registro y sincronizar ficha"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>

                          {/* 3. Imprimir / PDF en 1 Hoja (Oscuro Corporativo #0e011f con texto Blanco y acento Cian) */}
                          <button
                            type="button"
                            onClick={() => printOfficialPreRegistrationReceipt(r)}
                            className="px-2.5 py-1.5 rounded-xl bg-[#0e011f] hover:bg-[#1a0533] text-white border border-[#00C8D4]/40 text-[10px] font-black inline-flex items-center gap-1 shadow-sm hover:shadow transition-all cursor-pointer"
                            title="Reimprimir Comprobante PDF en 1 Hoja"
                          >
                            <Printer className="w-3.5 h-3.5 text-[#00C8D4]" />
                            <span>PDF</span>
                          </button>

                          {/* 4. Abrir Ficha Pública del Establecimiento (Esmeralda Sólido) */}
                          <a
                            href={`/establecimiento/${r.establishmentSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black inline-flex items-center gap-1 shadow-sm hover:shadow transition-all"
                            title="Abrir Ficha Pública del Establecimiento"
                          >
                            <Building2 className="w-3.5 h-3.5" />
                            <span>Ficha</span>
                          </a>

                          {/* 5. Abrir Certificado Público de Verificación QR (Púrpura Profundo #9B00CC) */}
                          <a
                            href={r.verificationPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-xl bg-[#9B00CC] hover:bg-[#8200ab] text-white text-[10px] font-black inline-flex items-center gap-1 shadow-sm hover:shadow transition-all"
                            title="Abrir Certificado Público de Verificación QR"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Verificar</span>
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

      {/* Modal de Edición Rápida No Destructiva del Pre-Registro */}
      {editingReceipt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0e011f]/85 backdrop-blur-md animate-fade-in overflow-y-auto"
          onClick={() => setEditingReceipt(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-[#00C8D4]/50 overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera del Modal de Edición */}
            <div className="bg-gradient-to-r from-[#0e011f] via-[#15062c] to-[#1a0533] text-white p-6 border-b-4 border-[#00C8D4] relative">
              <button
                type="button"
                onClick={() => setEditingReceipt(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-8">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF0096] text-white text-[10px] font-black uppercase tracking-wider mb-2">
                    <Edit3 className="w-3 h-3" />
                    <span>Edición Rápida • Sincronizada con Ficha Consolidada</span>
                  </span>
                  <h2
                    className="text-xl sm:text-2xl font-black text-white"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Editar Pre-Registro: {editingReceipt.establishmentTitle}
                  </h2>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="inline-block px-3 py-1 rounded-xl bg-white/10 border border-[#00C8D4]/40 text-[#00C8D4] font-mono font-black text-xs">
                    {editingReceipt.folio}
                  </span>
                  <span className="block text-[10px] font-mono text-slate-300 mt-1">
                    {editingReceipt.financialCorrelative}
                  </span>
                </div>
              </div>
            </div>

            {/* Formulario de Edición Operativa */}
            <form onSubmit={handleSaveEditedReceipt} className="p-6 space-y-4 text-slate-800">
              {/* Bloque de Datos de Auditoría Protegidos (Inmutables) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Trazabilidad y Auditoría Original Protegida (No Modificable)</span>
                  </span>
                  {editingReceipt.founderSlotNumber && (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-white text-[10px] font-black ${editModality === "exclusivo_prestigio" ? "bg-[#9B00CC]" : "bg-[#FF0096]"
                        }`}
                    >
                      {editModality === "exclusivo_prestigio"
                        ? `Cupo Prestigio Protegido: #${editingReceipt.founderSlotNumber} / ${MAX_FOUNDERS_QUOTA}`
                        : `Cupo Fundador Protegido: #${editingReceipt.founderSlotNumber} / ${MAX_FOUNDERS_QUOTA}`}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 font-semibold pt-1">
                  <div>
                    <span className="text-slate-400 font-bold">Folio:</span>{" "}
                    <strong className="font-mono text-slate-900">{editingReceipt.folio}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold">Fecha Original:</span>{" "}
                    <strong className="text-slate-900">{editingReceipt.createdAtFormatted}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold">IP / Consentimiento:</span>{" "}
                    <strong className="font-mono text-slate-900">{editingReceipt.clientIp} (✓ Legal)</strong>
                  </div>
                </div>
              </div>

              {/* Campos Operativos Editables */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    Nombre del Establecimiento *
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    Categoría Principal *
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4] cursor-pointer"
                  >
                    {!UNIFIED_PLATFORM_CATEGORIES.some(
                      (c) => c.label.toLowerCase() === editCategory.toLowerCase()
                    ) && <option value={editCategory}>{editCategory}</option>}
                    {UNIFIED_PLATFORM_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.label}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    Destino Turístico *
                  </label>
                  <input
                    type="text"
                    required
                    value={editDestination}
                    onChange={(e) => setEditDestination(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                      Estado
                    </label>
                    <input
                      type="text"
                      value={editState}
                      onChange={(e) => setEditState(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    Número de WhatsApp Directo *
                  </label>
                  <input
                    type="text"
                    required
                    value={editWhatsapp}
                    onChange={(e) => setEditWhatsapp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    Originador (Propietario / Gerente / Agente)
                  </label>
                  <input
                    type="text"
                    value={editRegistrant}
                    onChange={(e) => setEditRegistrant(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    Modalidad de Membresía
                  </label>
                  <select
                    value={editModality}
                    onChange={(e) => setEditModality(e.target.value as MembershipModality)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4] cursor-pointer"
                  >
                    <option value="fundadores_50">
                      Programa 50 Fundadores (Exonerado{editingReceipt.founderSlotNumber ? ` • Cupo #${editingReceipt.founderSlotNumber}/50` : ""})
                    </option>
                    <option value="exclusivo_prestigio">
                      Cliente Exclusivo / Prestigio 2026 (Exonerado{editingReceipt.founderSlotNumber ? ` • Cupo #${editingReceipt.founderSlotNumber}/50` : ""})
                    </option>
                    <option value="comercial_estandar">Membresía Comercial / Estándar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    URL de Imagen Principal (Opcional)
                  </label>
                  <input
                    type="text"
                    value={editPrimaryImage}
                    onChange={(e) => setEditPrimaryImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                  Notas u Observaciones Administrativas
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Añade notas operativas o comentarios de seguimiento comercial..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingReceipt(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:opacity-95 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingEdit ? "Guardando..." : "Guardar Cambios y Sincronizar"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Comprobante Oficial con QR */}
      <PreRegistrationReceiptModal
        receipt={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
}
