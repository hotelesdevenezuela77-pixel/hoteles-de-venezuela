import React from "react";
import { Link } from "wouter";
import { Shield, Lock, Eye, FileText, CheckCircle2, ArrowLeft } from "lucide-react";

export function Privacidad() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-10">
        
        {/* Header */}
        <div className="border-b border-slate-100 pb-6 mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#00C8D4] hover:underline mb-4 cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#9B00CC] to-[#FF0096] flex items-center justify-center text-white shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black font-serif text-[#1e293b]">
                Política de Privacidad
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Última actualización: Julio 2026 · Hoteles de Venezuela LLC
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <section className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#00C8D4]" /> 1. Compromiso de Privacidad
            </h2>
            <p>
              En <strong>Hoteles de Venezuela</strong>, nos tomamos muy en serio la protección de sus datos personales. Esta Política de Privacidad describe cómo recopilamos, utilizamos, almacenamos y protegemos la información proporcionada por los usuarios en nuestra plataforma web y canales oficiales de atención (incluyendo WhatsApp).
            </p>
          </section>

          <section className="p-5 rounded-2xl border border-slate-100">
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#FF0096]" /> 2. Información que Recopilamos
            </h2>
            <p className="mb-2">Recopilamos únicamente la información necesaria para coordinar reservas y prestar servicios turísticos:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nombre completo y datos de contacto (teléfono y correo electrónico).</li>
              <li>Consultas sobre alojamientos, fechas de viaje y número de huéspedes.</li>
              <li>Datos de facturación o comprobantes de pago cuando realiza una reserva directa.</li>
            </ul>
          </section>

          <section className="p-5 rounded-2xl border border-slate-100">
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#9B00CC]" /> 3. Uso de la Información y Canales Oficiales
            </h2>
            <p>
              Su información personal es utilizada exclusivamente para:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Facilitar la comunicación directa entre turistas y alojamientos verificados.</li>
              <li>Procesar solicitudes de asistencia a través de nuestra Inteligencia Artificial en WhatsApp.</li>
              <li>Enviar confirmaciones de reserva e información relevante sobre su viaje.</li>
            </ul>
            <p className="mt-2 text-xs font-semibold text-slate-500">
              Garantía: No vendemos, alquilamos ni compartimos sus datos con terceros no autorizados.
            </p>
          </section>

          <section className="p-5 rounded-2xl border border-slate-100">
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 4. Contacto y Derechos de Privacidad
            </h2>
            <p>
              Usted tiene derecho a acceder, corregir o solicitar la eliminación de su información personal en cualquier momento escribiendo a nuestro correo corporativo: <strong>partner@hotelesdevenezuela.com</strong>.
            </p>
          </section>

          <section className="p-5 rounded-2xl border border-slate-100 bg-slate-50">
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#FF0096]" /> 5. Eliminación de Datos de Usuarios (Meta / Facebook Login)
            </h2>
            <p className="mb-2">
              Conforme a las políticas de la plataforma Meta (Facebook/WhatsApp), los usuarios que inicien sesión o interactúen mediante nuestras integraciones oficiales pueden solicitar la eliminación definitiva de sus datos almacenados siguiendo estos pasos:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-xs text-slate-600">
              <li>Enviar un correo a <strong>partner@hotelesdevenezuela.com</strong> con el asunto <em>"Solicitud de Eliminación de Datos - Meta"</em>.</li>
              <li>Indicar su nombre completo y el número telefónico o correo asociado a su cuenta.</li>
              <li>Nuestro equipo procesará la eliminación completa de sus registros e interacciones en un lapso no mayor a 48 horas hábiles y le enviará una confirmación oficial.</li>
            </ol>
          </section>
        </div>

        {/* Footer info */}
        <div className="mt-10 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium">
            © 2026 Hoteles de Venezuela LLC. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
