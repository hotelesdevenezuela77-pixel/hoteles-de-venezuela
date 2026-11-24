import React, { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import {
  ShieldCheck,
  Building2,
  MapPin,
  Phone,
  Calendar,
  Award,
  CheckCircle2,
  Printer,
  ArrowLeft,
  Lock,
  UserCheck,
  AlertTriangle,
  Sparkles
} from "lucide-react";
import {
  getReceiptByFolio,
  syncSalesStateFromSupabase,
  type SalesPreRegistrationReceipt
} from "../lib/salesDepartmentStore";
import {
  getPublicVerificationUrl,
  printOfficialPreRegistrationReceipt,
  resolveReceiptEstablishmentImage
} from "../components/sales/PreRegistrationReceiptModal";

export function VerificarRegistro() {
  const [, params] = useRoute("/verificar-registro/:folio");
  const folioParam = decodeURIComponent(params?.folio || "").trim().toUpperCase();

  const [receipt, setReceipt] = useState<SalesPreRegistrationReceipt | null>(() =>
    getReceiptByFolio(folioParam)
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      await syncSalesStateFromSupabase();
      if (active) {
        setReceipt(getReceiptByFolio(folioParam));
        setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [folioParam]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="w-12 h-12 rounded-full border-4 border-t-[#00C8D4] border-r-[#FF0096] border-slate-200 animate-spin mb-4" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">
          Verificando autenticidad del folio {folioParam}...
        </p>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="min-h-[75vh] bg-slate-50 py-16 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center mx-auto shadow-lg">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-[11px] font-black uppercase tracking-wider">
            Folio No Localizado
          </span>
          <h1
            className="text-2xl sm:text-3xl font-black text-slate-900"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Verificación de Registro: {folioParam || "Sin Folio"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            No se encontró un comprobante oficial con el código <strong>{folioParam}</strong> en el
            registro central del Departamento de Ventas de Hoteles de Venezuela.
          </p>
          <div className="pt-3 flex flex-wrap justify-center gap-3">
            <Link
              href="/pre-registro"
              className="px-5 py-2.5 rounded-xl bg-[#00C8D4] text-slate-950 text-xs font-black uppercase tracking-wider"
            >
              Ir a Pre-Registro Oficial
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const verificationUrl = getPublicVerificationUrl(receipt);
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&color=0e011f&bgcolor=ffffff&data=${encodeURIComponent(
    verificationUrl
  )}`;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Banner Corporativo de Verificación */}
      <div className="bg-gradient-to-r from-[#0e011f] via-[#15062c] to-[#1a0533] text-white py-12 px-4 border-b-4 border-[#00C8D4]">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/pre-registro"
            className="inline-flex items-center gap-1.5 text-xs text-[#00C8D4] hover:text-white font-bold mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Módulo de Pre-Registro</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-black uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Certificado Digital Auténtico y Verificado</span>
              </div>
              <h1
                className="text-3xl sm:text-4xl font-black text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Validación Oficial de Pre-Registro
              </h1>
            </div>

            <div className="sm:text-right">
              <span className="inline-block px-4 py-2 rounded-xl bg-[#FF0096] text-white font-mono font-black text-base shadow-lg">
                {receipt.folio}
              </span>
              <span className="block text-xs font-mono font-bold text-[#00C8D4] mt-1">
                Correlativo Finanzas: {receipt.financialCorrelative}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido del Certificado */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-4 rounded-3xl bg-slate-50 border border-slate-200 items-stretch">
            <div className="md:col-span-5 relative rounded-2xl overflow-hidden bg-[#0e011f] border-2 border-[#00C8D4]/60 min-h-[190px] aspect-[4/3] md:aspect-auto">
              <img
                src={resolveReceiptEstablishmentImage(receipt)}
                alt={receipt.establishmentTitle}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e011f]/80 via-transparent to-transparent" />
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#FF0096] text-white text-[9px] font-black uppercase tracking-wider">
                Sello HDV Verificado
              </span>
            </div>

            <div className="md:col-span-7 flex flex-col justify-between space-y-3 py-1">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-lg bg-[#0e011f] text-[#00C8D4] text-[10px] font-black uppercase tracking-wider mb-1.5">
                  {receipt.categoryName}
                </span>
                <h2
                  className="text-2xl font-black text-slate-900"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {receipt.establishmentTitle}
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Ficha Oficial: hotelesdevenezuela.com/establecimiento/{receipt.establishmentSlug}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FF0096] text-white flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Ubicación
                    </span>
                    <p className="text-xs font-black text-slate-900">
                      {receipt.destinationName} ({receipt.city}, {receipt.state})
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[9px] font-black uppercase tracking-wider text-slate-400">
                      WhatsApp Oficial
                    </span>
                    <p className="text-xs font-black text-emerald-700">
                      {receipt.whatsappNumber}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bloque de Clasificación Comercial */}
          <div className="rounded-2xl bg-gradient-to-br from-[#0e011f] to-[#1a0533] text-white p-6 border border-[#9B00CC]/40 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-[#00C8D4] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FF0096]" />
                <span>Modalidad de Membresía & Estatus Financiero</span>
              </span>
              {receipt.founderSlotNumber && (
                <span className="px-3 py-1 rounded-full bg-[#FF0096] text-white text-xs font-black uppercase">
                  Cupo 50 Fundadores: #{receipt.founderSlotNumber} / 50
                </span>
              )}
            </div>

            <h2
              className="text-xl sm:text-2xl font-bold text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {receipt.modalityLabel}
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 font-semibold">
              {receipt.financialStatusLabel}
            </p>

            <div>
              {receipt.financialStatus === "exonerado" ? (
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#00C8D4] text-slate-950 text-xs font-black">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>MONTO: $0.00 USD (EXONERADO OFICIAL)</span>
                </span>
              ) : receipt.showAmountOnReceipt ? (
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#FF0096] text-white text-xs font-black">
                  <span>
                    Plan: {receipt.planName} • ${receipt.monthlyAmountUsd.toFixed(2)} USD/mes (Bs.{" "}
                    {receipt.monthlyAmountVes.toLocaleString("es-VE", {
                      minimumFractionDigits: 2
                    })}{" "}
                    BCV)
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#9B00CC] text-white text-xs font-black">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Membresía Asignada: {receipt.planName}</span>
                </span>
              )}
            </div>
          </div>

          {/* Trazabilidad y QR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#9B00CC] text-white flex items-center justify-center shrink-0">
                <UserCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Registrado Por
                </span>
                <p className="text-xs sm:text-sm font-black text-slate-900">
                  {receipt.registrantName}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Calendar className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Fecha, Hora Exacta e IP
                </span>
                <p className="text-xs sm:text-sm font-black text-slate-900">
                  {receipt.createdAtFormatted}
                </p>
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  IP: {receipt.clientIp}
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border-2 border-dashed border-[#00C8D4]/50 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-black uppercase">
                <Lock className="w-3.5 h-3.5" />
                <span>Firma Digital: {receipt.digitalSignatureHash}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Declaración Legal y Derechos de Imagen:</strong>{" "}
                {receipt.termsAcceptedText}
              </p>
            </div>

            <div className="bg-white p-3 rounded-2xl border-2 border-[#0e011f] shrink-0 text-center">
              <img
                src={qrImageUrl}
                alt={`QR ${receipt.folio}`}
                className="w-28 h-28 object-contain mx-auto"
              />
              <span className="block text-[9px] font-black uppercase text-[#0e011f] mt-1">
                {receipt.folio}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => printOfficialPreRegistrationReceipt(receipt)}
              className="px-6 py-3 rounded-2xl bg-[#0e011f] hover:bg-[#1a0533] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#00C8D4]" />
              <span>Imprimir / Descargar PDF Oficial</span>
            </button>

            <Link
              href={`/establecimiento/${receipt.establishmentSlug}`}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white text-xs font-black uppercase tracking-wider shadow-lg"
            >
              Ver Ficha Pública del Establecimiento
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
