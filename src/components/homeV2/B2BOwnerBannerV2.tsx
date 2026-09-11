import React from "react";
import { Link } from "wouter";
import { Building2, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export function B2BOwnerBannerV2() {
  return (
    <section className="py-16 bg-slate-50 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Banner Card con Gradiente Magenta/Púrpura de Marca */}
        <div className="relative rounded-3xl bg-gradient-to-r from-[#FF0096] via-[#9B00CC] to-[#0e011f] p-8 sm:p-12 md:p-14 shadow-2xl overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 text-left">
          
          {/* Elementos Decorativos de Fondo */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-[#00C8D4]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Columna Izquierda: Mensaje Comercial B2B */}
          <div className="space-y-4 max-w-2xl relative z-10">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-black uppercase tracking-wider">
              <div className="w-5 h-5 rounded-md bg-white flex items-center justify-center text-[#FF0096] shrink-0">
                <Building2 className="w-3 h-3 text-[#FF0096] stroke-[2.5]" />
              </div>
              <span>PARA DUENOS Y ADMINISTRADORES</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-display font-black text-white leading-tight tracking-tight">
              ¿Tienes un hotel o posada en Venezuela? <br className="hidden sm:block" />
              <span className="text-amber-300">Conecta directamente con miles de viajeros</span>
            </h2>

            <p className="text-white/90 text-xs sm:text-sm font-sans leading-relaxed">
              Únete al ecosistema líder de hospedajes en Venezuela. Publica tu propiedad, recibe solicitudes directas a tu WhatsApp y automatiza tus reservaciones sin pagar comisiones por huésped.
            </p>

            {/* Checklist de Beneficios Propietarios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs font-bold text-white/95">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>0% Comisiones por Reserva</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Enlace Directo a tu WhatsApp</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Posicionamiento SEO en Google</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Insignia de Verificación Oficial</span>
              </div>
            </div>

          </div>

          {/* Columna Derecha: Botón CTA Principal */}
          <div className="relative z-10 shrink-0 w-full lg:w-auto">
            <Link
              href="/membresias"
              className="w-full lg:w-auto px-8 py-4 bg-white hover:bg-slate-100 text-[#FF0096] font-black text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2.5 shadow-2xl shadow-black/20 hover:scale-105 transition-all cursor-pointer text-center"
            >
              <span>Publica tu Propiedad / Ver Planes</span>
              <ArrowRight className="w-4 h-4 text-[#FF0096] stroke-[2.5]" />
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
