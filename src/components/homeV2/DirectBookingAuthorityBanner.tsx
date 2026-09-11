import React from "react";
import { Link } from "wouter";
import { DollarSign, ShieldCheck, MessageCircle, HeartHandshake, Award } from "lucide-react";

export function DirectBookingAuthorityBanner() {
  return (
    <section className="py-16 bg-white border-y border-slate-200/80 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-12">
        
        {/* Title */}
        <div className="space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00C8D4]/10 text-[#00C8D4] border border-[#00C8D4]/20 text-xs font-black uppercase tracking-wider">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>MODELO 100% DIRECTO SIN INTERMEDIARIOS</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
            Reserva Directo con el Anfitrión. <br className="hidden sm:block" />
            <span className="text-gradient-brand">Sin Sobrecargos ni Tarifas Ocultas</span>
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Eliminamos la comisión del 15% al 25% que cobran las agencias internacionales. Trato humano y tarifa directa entre tú y la posada.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          
          {/* Pilar 1 */}
          <div className="bg-slate-50 border border-slate-200/70 p-6 rounded-3xl space-y-4 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-[#00C8D4] flex items-center justify-center text-white shadow-md shadow-[#00C8D4]/20">
              <DollarSign className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">0% Comisiones por Reserva</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Pagas la tarifa real fijada directamente por la propiedad, sin recargos sorpresa ni impuestos administrativos extra.
              </p>
            </div>
          </div>

          {/* Pilar 2 */}
          <div className="bg-slate-50 border border-slate-200/70 p-6 rounded-3xl space-y-4 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-[#FF0096] flex items-center justify-center text-white shadow-md shadow-[#FF0096]/20">
              <MessageCircle className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">Contacto Directo por WhatsApp</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Hablas directamente con el dueño o administrador para resolver dudas de transferencias, planta eléctrica o requerimientos especiales.
              </p>
            </div>
          </div>

          {/* Pilar 3 */}
          <div className="bg-slate-50 border border-slate-200/70 p-6 rounded-3xl space-y-4 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-[#9B00CC] flex items-center justify-center text-white shadow-md shadow-[#9B00CC]/20">
              <ShieldCheck className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">Verificación e Inspección HDV</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Cada hospedaje con la insignia "Sello HDV" ha sido inspeccionado para confirmar su operatividad y servicios publicados.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
