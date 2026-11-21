import React from "react";
import { Link } from "wouter";
import {
  FileText,
  ShieldCheck,
  Building2,
  Scale,
  Camera,
  CreditCard,
  Lock,
  CheckCircle2,
  ArrowLeft,
  MessageCircle
} from "lucide-react";

export function Terminos() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-10">
        {/* Header */}
        <div className="border-b border-slate-100 pb-6 mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#00C8D4] hover:underline mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Link>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0e011f] via-[#9B00CC] to-[#FF0096] flex items-center justify-center text-white shadow-md shrink-0">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1
                className="text-2xl sm:text-3xl font-black text-[#0f172a]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Términos y Condiciones de Uso
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Vigencia Oficial 2026 · Hoteles de Venezuela LLC (408 W Poplar St, Olathe, KS 66061, USA)
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          {/* 1. Objeto y Naturaleza de la Plataforma */}
          <section className="bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-100">
            <h2
              className="text-base sm:text-lg font-bold text-[#0f172a] mb-2.5 flex items-center gap-2.5"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              <span className="w-8 h-8 rounded-xl bg-[#00C8D4] text-white flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-white" />
              </span>
              <span>1. Objeto y Naturaleza de la Plataforma (Reservas Sin Intermediarios)</span>
            </h2>
            <p>
              <strong>Hoteles de Venezuela LLC</strong> opera el portal oficial{" "}
              <strong>hotelesdevenezuela.com</strong> como una guía turística, directorio certificado
              y ecosistema tecnológico SaaS que conecta directamente a los viajeros y turistas con
              los propietarios, gerentes y anfitriones de hoteles, posadas boutique, resorts,
              campamentos y operadores turísticos en Venezuela. Nuestra plataforma funciona bajo un
              modelo de <strong>0% comisiones de intermediación</strong>, facilitando el contacto
              directo vía WhatsApp oficial y canales verificados del establecimiento.
            </p>
          </section>

          {/* 2. Afiliación Comercial, Pre-Registro y Derechos de Imagen */}
          <section className="p-5 sm:p-6 rounded-2xl border border-slate-100">
            <h2
              className="text-base sm:text-lg font-bold text-[#0f172a] mb-2.5 flex items-center gap-2.5"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              <span className="w-8 h-8 rounded-xl bg-[#FF0096] text-white flex items-center justify-center shrink-0">
                <Camera className="w-4 h-4 text-white" />
              </span>
              <span>2. Pre-Registro, Afiliación Comercial y Derechos de Imagen</span>
            </h2>
            <p className="mb-2.5">
              Todo propietario, gerente o representante que registre o actualice un establecimiento
              a través del módulo de{" "}
              <Link href="/pre-registro" className="text-[#00C8D4] font-bold hover:underline">
                Pre-Registro Oficial
              </Link>{" "}
              o mediante un Agente de Ventas HDV declara y garantiza bajo fe de juramento que:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Ostenta la titularidad legal, representación mercantil (RIF / RTN) o autorización
                válida del establecimiento turístico registrado.
              </li>
              <li>
                Otorga autorización expresa, no exclusiva y gratuita a{" "}
                <strong>Hoteles de Venezuela LLC</strong> para reproducir, optimizar y publicar las
                fotografías, videos, logotipos, coordenadas GPS, tarifas referenciales y reseñas
                comerciales en el portal web, aplicaciones multi-tenant y canales promocionales de
                la marca.
              </li>
              <li>
                Cada alta comercial emite un <strong>Comprobante Oficial con Código QR</strong>{" "}
                (`HDV-PR-2026-XXXX`) y su correlativo financiero vinculado (`HDV-EXO-2026-XXXX` para
                membresías exoneradas del Programa 50 Fundadores y Selección Exclusiva Prestigio
                2026, o `HDV-FAC-2026-XXXX` para planes comerciales SaaS), junto con registro de
                dirección IP y sello digital de validación.
              </li>
            </ul>
          </section>

          {/* 3. Condiciones de Reserva, Tarifas y Pagos Directos */}
          <section className="p-5 sm:p-6 rounded-2xl border border-slate-100">
            <h2
              className="text-base sm:text-lg font-bold text-[#0f172a] mb-2.5 flex items-center gap-2.5"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              <span className="w-8 h-8 rounded-xl bg-[#9B00CC] text-white flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4 text-white" />
              </span>
              <span>3. Reservas, Tarifas y Transacciones Directas con el Alojamiento</span>
            </h2>
            <p className="mb-2">
              Dado que las reservaciones se concretan directamente entre el viajero y la recepción
              del establecimiento sin recargos de intermediación:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Los pagos por concepto de hospedaje (mediante Pago Móvil, transferencias bancarias a
                tasa BCV, Zelle, Binance Pay, tarjetas o efectivo) son recibidos directamente en las
                cuentas oficiales de cada hotel o posada.
              </li>
              <li>
                Cada establecimiento es responsable del cumplimiento de las condiciones de la
                estadía, políticas de cancelación, horarios de check-in / check-out y veracidad de
                sus servicios operativos (tales como Planta Eléctrica 24/7, Tanque de Agua continuo
                y conectividad Starlink).
              </li>
              <li>
                En reservas con menores de edad en territorio venezolano, el huésped deberá cumplir
                con la normativa vigente (LOPNNA) presentando partidas de nacimiento o permisos de
                viaje correspondientes al momento del check-in.
              </li>
            </ul>
          </section>

          {/* 4. Sello de Verificación HDV y Propiedad Intelectual */}
          <section className="p-5 sm:p-6 rounded-2xl border border-slate-100 bg-slate-50">
            <h2
              className="text-base sm:text-lg font-bold text-[#0f172a] mb-2.5 flex items-center gap-2.5"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-white" />
              </span>
              <span>4. Sello de Garantía Legal HDV y Propiedad Intelectual</span>
            </h2>
            <p>
              El diseño, código fuente, arquitectura multi-tenant, marcas, logotipos y el{" "}
              <strong>Sello de Verificación e Inspección HDV</strong> son propiedad exclusiva de{" "}
              <strong>Hoteles de Venezuela LLC</strong>. Queda prohibida la reproducción total o
              parcial del directorio, el scraping automatizado de contactos o el uso no autorizado de
              nuestras insignias de certificación.
            </p>
          </section>

          {/* 5. Privacidad, Jurisdicción y Contacto Legal */}
          <section className="p-5 sm:p-6 rounded-2xl border border-slate-100">
            <h2
              className="text-base sm:text-lg font-bold text-[#0f172a] mb-2.5 flex items-center gap-2.5"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              <span className="w-8 h-8 rounded-xl bg-[#0e011f] text-white flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-white" />
              </span>
              <span>5. Protección de Datos y Contacto Oficial</span>
            </h2>
            <p>
              El tratamiento de datos personales se rige por nuestra{" "}
              <Link href="/privacidad" className="text-[#00C8D4] font-bold hover:underline">
                Política de Privacidad Oficial
              </Link>
              . Para consultas legales, verificaciones de folios comerciales o soporte a viajeros y
              propietarios, puede comunicarse con nuestro equipo a través de{" "}
              <strong>partner@hotelesdevenezuela.com</strong> o en nuestro{" "}
              <Link href="/soporte" className="text-[#FF0096] font-bold hover:underline">
                Centro de Soporte Técnico 24/7
              </Link>
              .
            </p>
          </section>
        </div>

        {/* Tarjeta de Cierre Corporativa (Regla 4 AGENTS.md: Gradiente Magenta/Púrpura) */}
        <div
          className="mt-10 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl"
          style={{ background: "linear-gradient(135deg, #FF0096 0%, #9B00CC 100%)" }}
        >
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/85 block">
              Atención Legal y Comercial Directa
            </span>
            <h3
              className="text-xl sm:text-2xl font-bold text-white"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              ¿Deseas afiliar tu Hotel o Posada o necesitas asistencia?
            </h3>
            <p className="text-xs text-white/90">
              Nuestro Departamento de Ventas y Soporte está disponible para atenderte de inmediato.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              href="/pre-registro"
              className="px-5 py-3 rounded-2xl bg-white text-[#FF0096] text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
            >
              <CheckCircle2 className="w-4 h-4 text-[#FF0096]" />
              <span>Pre-Registro Oficial</span>
            </Link>
            <Link
              href="/soporte"
              className="px-5 py-3 rounded-2xl bg-[#0e011f] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg hover:bg-[#1a0533] transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#00C8D4]" />
              <span>Soporte 24/7</span>
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium">
            © {new Date().getFullYear()} Hoteles de Venezuela LLC. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
