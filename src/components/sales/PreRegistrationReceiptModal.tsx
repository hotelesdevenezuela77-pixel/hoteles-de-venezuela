import React, { useState } from "react";
import { Link } from "wouter";
import {
  ShieldCheck,
  QrCode,
  Printer,
  Copy,
  Check,
  ExternalLink,
  X,
  Building2,
  MapPin,
  Phone,
  Calendar,
  FileText,
  UserCheck,
  Award,
  Sparkles,
  CheckCircle2,
  Lock
} from "lucide-react";
import type { SalesPreRegistrationReceipt } from "../../lib/salesDepartmentStore";

interface PreRegistrationReceiptModalProps {
  receipt: SalesPreRegistrationReceipt | null;
  onClose: () => void;
}

/**
 * Construye la URL de verificación pública absoluta para el Código QR
 */
export function getPublicVerificationUrl(receipt: SalesPreRegistrationReceipt): string {
  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "https://hotelesdevenezuela.com";
  return `${origin}/verificar-registro/${encodeURIComponent(receipt.folio)}`;
}

/**
 * Imprime o exporta a PDF el Comprobante Oficial de Pre-Registro HDV en 1 sola hoja
 */
export function printOfficialPreRegistrationReceipt(receipt: SalesPreRegistrationReceipt) {
  const verificationUrl = getPublicVerificationUrl(receipt);
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&color=0e011f&bgcolor=ffffff&data=${encodeURIComponent(
    verificationUrl
  )}`;

  const win = window.open("", "_blank");
  if (!win) return;

  const amountHtml =
    receipt.financialStatus === "exonerado"
      ? `<div class="amount-pill exonerated">$0.00 USD — EXONERADO (100% BECADO / LANZAMIENTO)</div>`
      : receipt.showAmountOnReceipt
      ? `<div class="amount-pill commercial">$${receipt.monthlyAmountUsd.toFixed(
          2
        )} USD / mes (Bs. ${receipt.monthlyAmountVes.toLocaleString("es-VE", {
          minimumFractionDigits: 2
        })} a tasa BCV)</div>`
      : `<div class="amount-pill standard">${receipt.planName} — Asignación Oficial</div>`;

  win.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Comprobante Oficial ${receipt.folio} - Hoteles de Venezuela</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&display=swap');
    * { box-sizing: border-box; }
    body {
      font-family: 'Montserrat', sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 24px;
    }
    .sheet {
      max-width: 820px;
      margin: 0 auto;
      border: 2px solid #0e011f;
      border-radius: 20px;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #0e011f 0%, #1a0533 100%);
      color: #ffffff;
      padding: 24px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 4px solid #00C8D4;
    }
    .brand-title {
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      font-weight: 800;
      margin: 0;
    }
    .brand-sub {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: #00C8D4;
      font-weight: 800;
      margin-bottom: 4px;
      display: block;
    }
    .folio-box {
      text-align: right;
    }
    .folio-badge {
      display: inline-block;
      background: #FF0096;
      color: #ffffff;
      font-weight: 900;
      font-size: 14px;
      padding: 6px 14px;
      border-radius: 10px;
      letter-spacing: 0.05em;
    }
    .fin-badge {
      display: block;
      font-size: 11px;
      color: #00C8D4;
      font-weight: 800;
      margin-top: 6px;
    }
    .content {
      padding: 24px 28px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 18px;
    }
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 14px 16px;
    }
    .label {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      margin-bottom: 4px;
      display: block;
    }
    .val {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
    }
    .modality-banner {
      background: linear-gradient(135deg, #0e011f 0%, #1a0533 100%);
      color: #ffffff;
      border-radius: 16px;
      padding: 18px 20px;
      margin-bottom: 18px;
    }
    .modality-title {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-weight: 700;
      color: #00C8D4;
      margin: 0 0 6px 0;
    }
    .amount-pill {
      display: inline-block;
      margin-top: 8px;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 800;
    }
    .exonerated { background: #00C8D4; color: #0e011f; }
    .commercial { background: #FF0096; color: #ffffff; }
    .standard { background: #9B00CC; color: #ffffff; }
    .qr-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      border-top: 2px dashed #cbd5e1;
      padding-top: 18px;
      margin-top: 12px;
    }
    .qr-box {
      text-align: center;
      border: 2px solid #0e011f;
      border-radius: 14px;
      padding: 10px;
      background: #ffffff;
      shrink: 0;
    }
    .legal-text {
      font-size: 10px;
      color: #475569;
      line-height: 1.5;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div>
        <span class="brand-sub">Departamento Oficial de Ventas • Hoteles de Venezuela LLC</span>
        <h1 class="brand-title">Comprobante Oficial de Pre-Registro</h1>
      </div>
      <div class="folio-box">
        <span class="folio-badge">${receipt.folio}</span>
        <span class="fin-badge">Asiento Financiero: ${receipt.financialCorrelative}</span>
      </div>
    </div>

    <div class="content">
      <div class="grid-2">
        <div class="card">
          <span class="label">Establecimiento Afiliado</span>
          <div class="val">${receipt.establishmentTitle}</div>
          <div style="font-size: 11px; color: #475569; margin-top: 3px;">${receipt.categoryName}</div>
        </div>
        <div class="card">
          <span class="label">Destino y Contacto Oficial</span>
          <div class="val">${receipt.destinationName} (${receipt.city}, ${receipt.state})</div>
          <div style="font-size: 11px; color: #475569; margin-top: 3px;">WhatsApp: ${receipt.whatsappNumber}</div>
        </div>
      </div>

      <div class="modality-banner">
        <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #FF0096; font-weight: 800;">
          Clasificación Comercial y Estatus Financiero
        </span>
        <h2 class="modality-title">${receipt.modalityLabel}</h2>
        <div style="font-size: 12px; color: #e2e8f0; font-weight: 600;">${receipt.financialStatusLabel}</div>
        ${amountHtml}
      </div>

      <div class="grid-2">
        <div class="card">
          <span class="label">Registrado Por (Origen)</span>
          <div class="val">${receipt.registrantName}</div>
        </div>
        <div class="card">
          <span class="label">Fecha, Hora e IP de Auditoría</span>
          <div class="val">${receipt.createdAtFormatted}</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">IP: ${receipt.clientIp}</div>
        </div>
      </div>

      <div class="qr-section">
        <div style="flex: 1;">
          <div style="display: inline-block; background: #e6f9fa; color: #008f99; border: 1px solid #00C8D4; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 900; text-transform: uppercase; margin-bottom: 8px;">
            ✓ Sello Digital de Validación HDV • ${receipt.digitalSignatureHash}
          </div>
          <p class="legal-text">
            <strong>Términos y Derechos de Imagen Aceptados:</strong> ${receipt.termsAcceptedText}
          </p>
          <p class="legal-text" style="margin-top: 6px;">
            <strong>URL Pública de Verificación:</strong> ${verificationUrl}
          </p>
        </div>
        <div class="qr-box">
          <img src="${qrImageUrl}" alt="QR Verificación ${receipt.folio}" width="130" height="130" />
          <div style="font-size: 9px; font-weight: 800; color: #0e011f; margin-top: 4px;">ESCANEAR PARA VALIDAR</div>
        </div>
      </div>
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400);
    };
  </script>
</body>
</html>`);
  win.document.close();
}

export function PreRegistrationReceiptModal({
  receipt,
  onClose
}: PreRegistrationReceiptModalProps) {
  const [copied, setCopied] = useState(false);

  if (!receipt) return null;

  const verificationUrl = getPublicVerificationUrl(receipt);
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&color=0e011f&bgcolor=ffffff&data=${encodeURIComponent(
    verificationUrl
  )}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0e011f]/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#00C8D4]/40 overflow-hidden my-8">
        {/* Cabecera Oficial Oscura (#0e011f a #1a0533 - Regla AGENTS.md sin negro puro) */}
        <div className="bg-gradient-to-r from-[#0e011f] via-[#15062c] to-[#1a0533] text-white p-6 sm:p-7 border-b-4 border-[#00C8D4] relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Cerrar comprobante"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00C8D4]/20 border border-[#00C8D4]/40 text-[#00C8D4] text-[10px] font-black uppercase tracking-widest mb-2">
                <Sparkles className="w-3 h-3 text-[#FF0096]" />
                <span>Departamento de Ventas • Comprobante Oficial</span>
              </div>
              <h2
                className="text-2xl sm:text-3xl font-black text-white tracking-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Comprobante de Pre-Registro HDV
              </h2>
            </div>

            <div className="sm:text-right shrink-0">
              <span className="inline-block px-3.5 py-1.5 rounded-xl bg-[#FF0096] text-white font-mono font-black text-sm shadow-lg">
                {receipt.folio}
              </span>
              <span className="block text-[11px] font-mono font-extrabold text-[#00C8D4] mt-1">
                Finanzas: {receipt.financialCorrelative}
              </span>
            </div>
          </div>
        </div>

        {/* Cuerpo del Comprobante */}
        <div className="p-6 sm:p-7 space-y-5 text-slate-800">
          {/* Datos del Establecimiento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#00C8D4] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Building2 className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Establecimiento
                </span>
                <p className="text-sm font-black text-slate-900 truncate">
                  {receipt.establishmentTitle}
                </p>
                <span className="text-xs font-bold text-[#008f99]">{receipt.categoryName}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FF0096] text-white flex items-center justify-center shrink-0 shadow-sm">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Destino & WhatsApp Oficial
                </span>
                <p className="text-sm font-black text-slate-900 truncate">
                  {receipt.destinationName} ({receipt.city}, {receipt.state})
                </p>
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {receipt.whatsappNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Tarjeta Destacada de Modalidad / Membresía y Estatus Económico */}
          <div className="rounded-2xl bg-gradient-to-br from-[#0e011f] to-[#1a0533] text-white p-5 border border-[#9B00CC]/40 shadow-lg space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00C8D4] flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#FF0096]" />
                <span>Modalidad de Ingreso & Estatus Financiero</span>
              </span>

              {receipt.founderSlotNumber && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#FF0096] text-white text-[10px] font-black uppercase">
                  Cupo Fundador #{receipt.founderSlotNumber} / 50
                </span>
              )}
            </div>

            <h3
              className="text-lg sm:text-xl font-bold text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {receipt.modalityLabel}
            </h3>

            <p className="text-xs text-slate-200 font-semibold">{receipt.financialStatusLabel}</p>

            {/* Regla de visibilidad de monto según modalidad y origen */}
            <div className="pt-1">
              {receipt.financialStatus === "exonerado" ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#00C8D4] text-slate-950 text-xs font-black">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>MONTO: $0.00 USD (MEMBRESÍA EXONERADA)</span>
                </div>
              ) : receipt.showAmountOnReceipt ? (
                <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FF0096] text-white text-xs font-black">
                  <span>Plan: {receipt.planName}</span>
                  <span>•</span>
                  <span>${receipt.monthlyAmountUsd.toFixed(2)} USD / mes</span>
                  <span className="text-white/85 font-bold">
                    (Bs.{" "}
                    {receipt.monthlyAmountVes.toLocaleString("es-VE", {
                      minimumFractionDigits: 2
                    })}{" "}
                    BCV)
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#9B00CC] text-white text-xs font-black">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Membresía Asignada: {receipt.planName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Trazabilidad: Quién realizó el registro, Fecha/Hora e IP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#9B00CC] text-white flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Originador del Registro
                </span>
                <p className="text-xs font-extrabold text-slate-900">{receipt.registrantName}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Fecha, Hora Exacta e IP
                </span>
                <p className="text-xs font-extrabold text-slate-900">
                  {receipt.createdAtFormatted}
                </p>
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  IP: {receipt.clientIp}
                </span>
              </div>
            </div>
          </div>

          {/* Bloque de Código QR y Sello Digital de Validación */}
          <div className="p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-[#00C8D4]/50 flex flex-col sm:flex-row items-center gap-5">
            <div className="bg-white p-2.5 rounded-2xl border-2 border-[#0e011f] shadow-md shrink-0 text-center">
              <img
                src={qrImageUrl}
                alt={`Código QR ${receipt.folio}`}
                className="w-32 h-32 object-contain mx-auto"
              />
              <span className="block text-[9px] font-black uppercase tracking-wider text-[#0e011f] mt-1">
                Validación QR Oficial
              </span>
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                <Lock className="w-3 h-3" />
                <span>Sello Digital: {receipt.digitalSignatureHash}</span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                {receipt.termsAcceptedText}
              </p>

              <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>¡Enlace Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Enlace de Verificación</span>
                    </>
                  )}
                </button>

                <Link
                  href={receipt.verificationPath}
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-xl bg-[#00C8D4]/15 hover:bg-[#00C8D4]/25 text-[#008f99] text-[11px] font-extrabold flex items-center gap-1.5 transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Abrir Ruta de Verificación</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Botones de Acción del Modal */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => printOfficialPreRegistrationReceipt(receipt)}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#0e011f] hover:bg-[#1a0533] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#00C8D4]" />
              <span>Descargar PDF / Imprimir Comprobante</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:opacity-95 text-white text-xs font-black uppercase tracking-wider shadow-lg transition-all cursor-pointer"
            >
              Finalizar y Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
