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

const DEFAULT_ESTABLISHMENT_PHOTO =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop";

/**
 * Resuelve la fotografía destacada del establecimiento afiliado:
 * 1. `receipt.primaryImage`
 * 2. Galería guardada en `hdv_prereg_<slug>` o `hdv_mock_establishments`
 * 3. Fallback fotográfico limpio
 */
export function resolveReceiptEstablishmentImage(receipt: SalesPreRegistrationReceipt): string {
  if (receipt.primaryImage && receipt.primaryImage.trim().length > 5) {
    return receipt.primaryImage.trim();
  }
  if (typeof window !== "undefined" && receipt.establishmentSlug) {
    try {
      const preregRaw = localStorage.getItem(`hdv_prereg_${receipt.establishmentSlug}`);
      if (preregRaw) {
        const parsed = JSON.parse(preregRaw);
        if (parsed?.primary_image) return String(parsed.primary_image);
        if (Array.isArray(parsed?.gallery_images) && parsed.gallery_images[0]) {
          return String(parsed.gallery_images[0]);
        }
      }
      const localEsts = JSON.parse(localStorage.getItem("hdv_mock_establishments") || "[]");
      const found = localEsts.find((e: any) => e?.slug === receipt.establishmentSlug);
      if (found?.primary_image) return String(found.primary_image);
    } catch {}
  }
  return DEFAULT_ESTABLISHMENT_PHOTO;
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
 * Imprime o exporta a PDF el Comprobante Oficial de Pre-Registro HDV en 1 sola hoja (Diseño Credencial VIP Ejecutiva)
 */
export function printOfficialPreRegistrationReceipt(receipt: SalesPreRegistrationReceipt) {
  const verificationUrl = getPublicVerificationUrl(receipt);
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&color=0e011f&bgcolor=ffffff&data=${encodeURIComponent(
    verificationUrl
  )}`;
  const estImageUrl = resolveReceiptEstablishmentImage(receipt);

  const win = window.open("", "_blank");
  if (!win) return;

  const founderOrTierBadge = receipt.founderSlotNumber
    ? `ALIANZA 50 FUNDADORES • CUPO OFICIAL #${receipt.founderSlotNumber} / 50`
    : receipt.modality === "exclusivo_prestigio"
    ? "SELECCIÓN EXCLUSIVA • COLECCIÓN PRESTIGIO 2026"
    : `AFILIACIÓN COMERCIAL OFICIAL • ${receipt.planName.toUpperCase()}`;

  const consolidationBadge = receipt.wasConsolidatedExisting
    ? "✓ Ficha Oficial Consolidada (Sin Duplicados)"
    : "✓ Ficha Oficial Verificada HDV";

  const amountHtml =
    receipt.financialStatus === "exonerado"
      ? `<div class="amount-pill exonerated">MONTO: $0.00 USD — MEMBRESÍA 100% EXONERADA (LANZAMIENTO)</div>`
      : receipt.showAmountOnReceipt
      ? `<div class="amount-pill commercial">PLAN: ${receipt.planName.toUpperCase()} • $${receipt.monthlyAmountUsd.toFixed(
          2
        )} USD / MES (Bs. ${receipt.monthlyAmountVes.toLocaleString("es-VE", {
          minimumFractionDigits: 2
        })} BCV)</div>`
      : `<div class="amount-pill standard">MEMBRESÍA ASIGNADA: ${receipt.planName.toUpperCase()}</div>`;

  win.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Credencial Oficial ${receipt.folio} - ${receipt.establishmentTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&display=swap');
    @page {
      size: A4 portrait;
      margin: 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Montserrat', sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 12px;
    }
    .sheet {
      max-width: 790px;
      margin: 0 auto;
      border: 2px solid #0e011f;
      border-radius: 18px;
      overflow: hidden;
      background: #ffffff;
      page-break-inside: avoid;
    }
    .header {
      background: linear-gradient(135deg, #0e011f 0%, #1a0533 100%);
      color: #ffffff;
      padding: 18px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      border-bottom: 4px solid #00C8D4;
    }
    .vip-kicker {
      display: inline-block;
      background: rgba(0, 200, 212, 0.18);
      border: 1px solid rgba(0, 200, 212, 0.55);
      color: #00C8D4;
      font-size: 9px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      padding: 4px 10px;
      border-radius: 999px;
      margin-bottom: 6px;
    }
    .brand-title {
      font-family: 'Playfair Display', serif;
      font-size: 21px;
      font-weight: 800;
      margin: 0;
      color: #ffffff;
      line-height: 1.15;
    }
    .brand-sub {
      font-size: 10px;
      color: #cbd5e1;
      font-weight: 600;
      margin-top: 3px;
      display: block;
    }
    .folio-box {
      text-align: right;
      flex-shrink: 0;
    }
    .folio-badge {
      display: inline-block;
      background: linear-gradient(135deg, #FF0096 0%, #9B00CC 100%);
      color: #ffffff;
      font-weight: 900;
      font-size: 13px;
      padding: 6px 14px;
      border-radius: 10px;
      letter-spacing: 0.05em;
      border: 1px solid rgba(255,255,255,0.25);
    }
    .fin-badge {
      display: block;
      font-size: 10px;
      color: #00C8D4;
      font-weight: 800;
      margin-top: 5px;
      letter-spacing: 0.04em;
    }
    .content {
      padding: 18px 24px;
    }
    /* Bloque VIP con Fotografía Prominente del Establecimiento */
    .hero-credential {
      display: grid;
      grid-template-columns: 230px 1fr;
      gap: 16px;
      background: #f8fafc;
      border: 1.5px solid #cbd5e1;
      border-radius: 16px;
      padding: 12px;
      margin-bottom: 14px;
      align-items: stretch;
    }
    .photo-frame {
      position: relative;
      width: 100%;
      height: 158px;
      border-radius: 12px;
      overflow: hidden;
      background: #0e011f;
      border: 2px solid #00C8D4;
    }
    .photo-frame img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .photo-seal {
      position: absolute;
      top: 8px;
      left: 8px;
      background: #FF0096;
      color: #ffffff;
      font-size: 8px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 3px 8px;
      border-radius: 999px;
    }
    .photo-caption {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(180deg, transparent 0%, rgba(14,1,31,0.88) 100%);
      color: #ffffff;
      font-size: 9px;
      font-weight: 800;
      padding: 12px 8px 6px 8px;
    }
    .hero-details {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 2px 4px;
    }
    .est-category-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .cat-pill {
      display: inline-block;
      background: #0e011f;
      color: #00C8D4;
      font-size: 9px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 3px 9px;
      border-radius: 6px;
    }
    .consolidation-pill {
      display: inline-block;
      background: #dcfce7;
      color: #166534;
      border: 1px solid #86efac;
      font-size: 9px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 6px;
    }
    .est-title {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin: 5px 0 3px 0;
      line-height: 1.15;
    }
    .est-meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 6px;
      padding-top: 8px;
      border-top: 1px solid #e2e8f0;
    }
    .label {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      margin-bottom: 2px;
      display: block;
    }
    .val {
      font-size: 11.5px;
      font-weight: 800;
      color: #0f172a;
    }
    .modality-banner {
      background: linear-gradient(135deg, #0e011f 0%, #1a0533 100%);
      color: #ffffff;
      border-radius: 14px;
      padding: 14px 18px;
      margin-bottom: 14px;
      border: 1px solid rgba(155, 0, 204, 0.45);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
    }
    .modality-title {
      font-family: 'Playfair Display', serif;
      font-size: 16px;
      font-weight: 700;
      color: #00C8D4;
      margin: 2px 0 3px 0;
    }
    .amount-pill {
      display: inline-block;
      margin-top: 6px;
      padding: 5px 11px;
      border-radius: 8px;
      font-size: 10.5px;
      font-weight: 900;
      letter-spacing: 0.03em;
    }
    .exonerated { background: #00C8D4; color: #0e011f; }
    .commercial { background: #FF0096; color: #ffffff; }
    .standard { background: #9B00CC; color: #ffffff; }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 14px;
    }
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 10px 14px;
    }
    .qr-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      border-top: 1.5px dashed #cbd5e1;
      padding-top: 12px;
    }
    .qr-box {
      text-align: center;
      border: 2px solid #0e011f;
      border-radius: 12px;
      padding: 8px;
      background: #ffffff;
      flex-shrink: 0;
    }
    .legal-text {
      font-size: 9.2px;
      color: #475569;
      line-height: 1.42;
      margin: 0;
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
        <span class="vip-kicker">★ ${founderOrTierBadge}</span>
        <h1 class="brand-title">Credencial Oficial de Afiliación & Pre-Registro</h1>
        <span class="brand-sub">Departamento Oficial de Ventas • Hoteles de Venezuela LLC (hotelesdevenezuela.com)</span>
      </div>
      <div class="folio-box">
        <span class="folio-badge">${receipt.folio}</span>
        <span class="fin-badge">Correlativo Finanzas: ${receipt.financialCorrelative}</span>
      </div>
    </div>

    <div class="content">
      <!-- Tarjeta Principal VIP con Fotografía Prominente del Establecimiento -->
      <div class="hero-credential">
        <div class="photo-frame">
          <img
            src="${estImageUrl}"
            alt="${receipt.establishmentTitle}"
            onerror="this.onerror=null;this.src='${DEFAULT_ESTABLISHMENT_PHOTO}';"
          />
          <span class="photo-seal">SELLO HDV 2026</span>
          <div class="photo-caption">${receipt.destinationName} • Venezuela</div>
        </div>

        <div class="hero-details">
          <div>
            <div class="est-category-row">
              <span class="cat-pill">${receipt.categoryName}</span>
              <span class="consolidation-pill">${consolidationBadge}</span>
            </div>
            <h2 class="est-title">${receipt.establishmentTitle}</h2>
            <div style="font-size: 10.5px; color: #475569; font-weight: 600;">
              URL Oficial en Directorio: <strong>hotelesdevenezuela.com/establecimiento/${receipt.establishmentSlug}</strong>
            </div>
          </div>

          <div class="est-meta-grid">
            <div>
              <span class="label">Ubicación / Destino Turístico</span>
              <div class="val">${receipt.destinationName} (${receipt.city}, ${receipt.state})</div>
            </div>
            <div>
              <span class="label">WhatsApp Directo Verificado</span>
              <div class="val" style="color: #047857;">${receipt.whatsappNumber}</div>
            </div>
            <div>
              <span class="label">Modalidad de Tarifas Públicas</span>
              <div class="val" style="color: #008f99;">Tarifa directa a consultar (0% Comisión)</div>
            </div>
            <div>
              <span class="label">Folio Único de Afiliación</span>
              <div class="val">${receipt.folio}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Banner Ejecutivo de Clasificación Comercial y Estatus Financiero -->
      <div class="modality-banner">
        <div>
          <span style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.15em; color: #FF0096; font-weight: 900;">
            Clasificación Comercial y Sincronización con Módulo de Finanzas
          </span>
          <h3 class="modality-title">${receipt.modalityLabel}</h3>
          <div style="font-size: 11px; color: #e2e8f0; font-weight: 600;">${receipt.financialStatusLabel}</div>
          ${amountHtml}
        </div>
        ${
          receipt.founderSlotNumber
            ? `<div style="text-align: center; background: rgba(255,255,255,0.08); border: 1.5px solid #00C8D4; border-radius: 12px; padding: 8px 14px; flex-shrink: 0;">
                 <span style="display: block; font-size: 8.5px; font-weight: 900; color: #00C8D4; text-transform: uppercase; letter-spacing: 0.1em;">Cupo Fundador</span>
                 <span style="font-size: 18px; font-weight: 900; color: #ffffff;">#${receipt.founderSlotNumber}<span style="font-size: 11px; color: #94a3b8;">/50</span></span>
               </div>`
            : ""
        }
      </div>

      <!-- Trazabilidad de Origen y Auditoría -->
      <div class="grid-2">
        <div class="card">
          <span class="label">Originador del Registro</span>
          <div class="val">${receipt.registrantName}</div>
        </div>
        <div class="card">
          <span class="label">Fecha, Hora Exacta e IP de Auditoría</span>
          <div class="val">${receipt.createdAtFormatted}</div>
          <div style="font-size: 9.5px; color: #64748b; font-weight: 700; margin-top: 2px;">IP Dispositivo: ${receipt.clientIp}</div>
        </div>
      </div>

      <!-- Sección Legal, Firma Digital y Código QR -->
      <div class="qr-section">
        <div style="flex: 1;">
          <div style="display: inline-block; background: #e6f9fa; color: #008f99; border: 1px solid #00C8D4; padding: 3px 10px; border-radius: 6px; font-size: 9.5px; font-weight: 900; text-transform: uppercase; margin-bottom: 6px;">
            ✓ Sello Digital de Validación HDV • ${receipt.digitalSignatureHash}
          </div>
          <p class="legal-text">
            <strong>Cláusula Legal y Derechos de Imagen Aceptados:</strong> "${receipt.termsAcceptedText}"<br/>
            <span>Consentimiento digital registrado el <strong>${receipt.createdAtFormatted}</strong> desde la dirección IP <strong>${receipt.clientIp}</strong> conforme a los Términos y Condiciones oficiales (https://hotelesdevenezuela.com/terminos).</span>
          </p>
          <p class="legal-text" style="margin-top: 4px;">
            <strong>Verificación Pública QR:</strong> ${verificationUrl}
          </p>
        </div>
        <div class="qr-box">
          <img src="${qrImageUrl}" alt="QR Verificación ${receipt.folio}" width="112" height="112" />
          <div style="font-size: 8px; font-weight: 900; color: #0e011f; margin-top: 3px; letter-spacing: 0.05em;">VALIDAR AUTENTICIDAD</div>
        </div>
      </div>
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 450);
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
  const establishmentPhoto = resolveReceiptEstablishmentImage(receipt);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0e011f]/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border-2 border-[#00C8D4]/50 overflow-hidden my-6">
        {/* Cabecera Ejecutiva de Credencial VIP (#0e011f a #1a0533 - Regla AGENTS.md sin negro puro) */}
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
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00C8D4]/20 border border-[#00C8D4]/50 text-[#00C8D4] text-[10px] font-black uppercase tracking-widest">
                  <Sparkles className="w-3 h-3 text-[#FF0096]" />
                  <span>Credencial Oficial de Afiliación HDV</span>
                </span>
                {receipt.founderSlotNumber && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FF0096] text-white text-[10px] font-black uppercase tracking-wider shadow">
                    <Award className="w-3 h-3" />
                    <span>Alianza 50 Fundadores • Cupo #{receipt.founderSlotNumber}/50</span>
                  </span>
                )}
              </div>
              <h2
                className="text-2xl sm:text-3xl font-black text-white tracking-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {receipt.establishmentTitle}
              </h2>
              <p className="text-xs text-slate-300 font-semibold mt-0.5">
                {receipt.categoryName} • {receipt.destinationName} ({receipt.city}, {receipt.state})
              </p>
            </div>

            <div className="sm:text-right shrink-0 bg-white/5 border border-white/15 rounded-2xl p-3">
              <span className="block text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1">
                Folio Oficial Pre-Registro
              </span>
              <span className="inline-block px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white font-mono font-black text-sm shadow-lg">
                {receipt.folio}
              </span>
              <span className="block text-[11px] font-mono font-extrabold text-[#00C8D4] mt-1.5">
                Finanzas: {receipt.financialCorrelative}
              </span>
            </div>
          </div>
        </div>

        {/* Cuerpo del Comprobante VIP */}
        <div className="p-6 sm:p-7 space-y-5 text-slate-800">
          {/* Bloque Principal de Credencial: Fotografía Prominente + Ficha del Establecimiento */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-inner items-stretch">
            {/* Fotografía Prominente del Establecimiento */}
            <div className="md:col-span-5 relative rounded-2xl overflow-hidden bg-[#0e011f] border-2 border-[#00C8D4]/60 shadow-md min-h-[185px] aspect-[4/3] md:aspect-auto">
              <img
                src={establishmentPhoto}
                alt={receipt.establishmentTitle}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = DEFAULT_ESTABLISHMENT_PHOTO;
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e011f]/85 via-transparent to-[#0e011f]/30 pointer-events-none" />

              <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FF0096] text-white text-[9px] font-black uppercase tracking-wider shadow">
                <ShieldCheck className="w-3 h-3" />
                <span>Sello HDV Verificado</span>
              </span>

              <div className="absolute bottom-2.5 left-3 right-3 text-white">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#00C8D4] block">
                  {receipt.categoryName}
                </span>
                <p className="text-xs font-black truncate">{receipt.establishmentTitle}</p>
              </div>
            </div>

            {/* Datos Ejecutivos del Establecimiento Afiliado */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-3 py-1">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[#0e011f] text-[#00C8D4] text-[10px] font-black uppercase tracking-wider">
                    {receipt.categoryName}
                  </span>
                  {receipt.wasConsolidatedExisting ? (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black uppercase tracking-wider">
                      ✓ Ficha Existente Consolidada (Sin Duplicados)
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200 text-[10px] font-black uppercase tracking-wider">
                      ✓ Ficha Oficial Activa en Directorio
                    </span>
                  )}
                </div>

                <h3
                  className="text-xl font-black text-slate-900 leading-snug"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {receipt.establishmentTitle}
                </h3>

                <p className="text-[11px] text-slate-500 font-semibold">
                  URL Oficial:{" "}
                  <strong className="text-slate-800 font-mono">
                    hotelesdevenezuela.com/establecimiento/{receipt.establishmentSlug}
                  </strong>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-200">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#FF0096] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Destino Turístico
                    </span>
                    <p className="text-xs font-black text-slate-900 truncate">
                      {receipt.destinationName}
                    </p>
                    <span className="text-[10px] text-slate-500 font-semibold block truncate">
                      {receipt.city}, {receipt.state}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[9px] font-black uppercase tracking-wider text-slate-400">
                      WhatsApp Directo
                    </span>
                    <p className="text-xs font-black text-emerald-700 truncate">
                      {receipt.whatsappNumber}
                    </p>
                    <span className="text-[10px] text-[#008f99] font-bold block">
                      Tarifa directa a consultar
                    </span>
                  </div>
                </div>
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

              <p className="text-[11px] text-slate-700 leading-relaxed font-semibold">
                "{receipt.termsAcceptedText}"
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                Aceptación legal asentada el <strong>{receipt.createdAtFormatted}</strong> desde la IP{" "}
                <strong className="font-mono">{receipt.clientIp}</strong> •{" "}
                <a
                  href="/terminos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#008f99] underline font-bold hover:text-[#FF0096]"
                >
                  Ver Términos y Condiciones
                </a>
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
