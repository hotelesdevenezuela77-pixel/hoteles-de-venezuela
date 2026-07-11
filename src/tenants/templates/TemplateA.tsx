import React from "react";
import { useTenant } from "../tenantContext";
import { GradientHeader } from "../components/GradientHeader";
import { BookingForm } from "./components/BookingForm";
import { BottomCTA } from "../components/BottomCTA";
import { Wifi, Shield, ShieldAlert, Award, Star, MapPin } from "lucide-react";

export function TemplateA() {
  const { config } = useTenant();

  // Mapeo de iconos para servicios comunes (cajas de fondo sólido de color con SVG blanco puro)
  const serviceItems = [
    { icon: <Wifi className="w-5 h-5 text-white" />, label: "WiFi de Alta Velocidad", bg: "bg-[#00C8D4]" },
    { icon: <Shield className="w-5 h-5 text-white" />, label: "Seguridad 24/7", bg: "bg-[#9B00CC]" },
    { icon: <Award className="w-5 h-5 text-white" />, label: "Sello Calidad HDV", bg: "bg-[#FF0096]" },
  ];

  return (
    <div className="min-h-screen bg-[#0e011f] text-slate-100 selection:bg-[#FF0096] selection:text-white">
      
      {/* Cabecera corporativa oficial */}
      <GradientHeader 
        preTitle="HOSPEDAJE ESTÁNDAR RED HDV" 
        subtitle="Un refugio acogedor con la garantía y estándares de Hoteles de Venezuela."
      />

      {/* Sección: Presentación del Hotel */}
      <section id="inicio" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[10px] tracking-[0.25em] font-extrabold text-[#00C8D4] uppercase block">
              BIENVENIDO A TU PRÓXIMO DESTINO
            </span>
            <h2 className="text-3xl md:text-5xl font-black font-serif text-white leading-tight">
              Disfruta la calidez de <span className="text-[#FF0096]">{config.name}</span>
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed font-light">
              Ubicado en una de las zonas más privilegiadas del país, nuestro establecimiento combina el confort hogareño con servicios de primera clase. Nos enfocamos en ofrecer una experiencia de descanso óptima, ideal para parejas, familias y viajeros aventureros.
            </p>

            {/* Dirección */}
            <div className="flex items-center gap-3 text-xs text-[#00C8D4] font-semibold bg-[#1a0533] p-4 rounded-2xl border border-[#9B00CC]/10 max-w-md">
              <div className="p-2 bg-[#00C8D4] rounded-lg flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <span>Dominio asignado: {config.domain}</span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative group overflow-hidden rounded-3xl border border-[#9B00CC]/20 shadow-2xl">
              <img 
                src={config.branding.banner_url} 
                alt={config.name}
                className="w-full h-80 object-cover scale-[1.08] group-hover:scale-100 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e011f] via-transparent to-transparent"></div>
              
              <div className="absolute bottom-4 left-4 right-4 bg-[#1a0533]/95 backdrop-blur border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Garantía Directa</p>
                  <p className="text-sm font-bold text-white">Tarifa Garantizada</p>
                </div>
                <div className="flex items-center gap-1 text-[#FF0096]">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current text-white/20" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Sección: Servicios Destacados (Iconos unicolor en cajas sólidas de color) */}
      <section id="servicios" className="py-16 bg-[#1a0533]/40 border-y border-[#9B00CC]/10 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <div>
            <span className="text-[10px] tracking-[0.25em] font-extrabold text-[#9B00CC] uppercase block mb-2">
              COMODIDADES Y VALOR
            </span>
            <h3 className="text-2xl md:text-4xl font-black font-serif text-white">Servicios Incluidos en tu Estancia</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {serviceItems.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-[#0e011f] border border-[#9B00CC]/10 hover:border-[#00C8D4]/40 p-6 rounded-2xl transition-all duration-300 flex flex-col items-center text-center space-y-4"
              >
                {/* Caja de fondo sólido de color con vector SVG en blanco por dentro */}
                <div className={`p-4 rounded-2xl ${item.bg} flex items-center justify-center shadow-lg shadow-black/20`}>
                  {item.icon}
                </div>
                <h4 className="text-sm font-bold tracking-wider text-slate-200">{item.label}</h4>
                <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
                  Gestionado mediante la infraestructura en la nube de Hoteles de Venezuela para asegurar tu tranquilidad.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección: Habitaciones y Cotizador (Aislamiento Lógico del Tenant) */}
      <section id="habitaciones" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-7 space-y-8">
            <div>
              <span className="text-[10px] tracking-[0.25em] font-extrabold text-[#FF0096] uppercase block mb-2">
                RESERVA DIRECTA SIN INTERMEDIARIOS
              </span>
              <h3 className="text-2xl md:text-4xl font-black font-serif text-white">Nuestras Opciones de Alojamiento</h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Todas las habitaciones incluyen desayuno continental, baño privado de lujo y acceso a las áreas sociales del hotel.
              </p>
            </div>

            {/* Catálogo visual de habitaciones */}
            <div className="space-y-6">
              {/* Carga automática simulada */}
              <div className="bg-[#1a0533] border border-[#9B00CC]/20 rounded-3xl p-6 flex flex-col md:flex-row gap-6 hover:border-[#00C8D4]/40 transition-colors">
                <img 
                  src="https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop" 
                  alt="Habitación Principal"
                  className="w-full md:w-48 h-32 object-cover rounded-2xl border border-white/5"
                />
                <div className="space-y-2 flex-grow">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold font-serif text-white">Estudio Vista al Mar</h4>
                    <span className="text-xs font-black text-[#00C8D4] bg-[#00C8D4]/10 px-3 py-1 rounded-full">$85 USD / Noche</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Un espacio elegante ideal para parejas. Cuenta con balcón privado con vistas al atardecer y todas las comodidades modernas.
                  </p>
                  <div className="flex gap-4 text-[10px] text-slate-500 font-semibold uppercase">
                    <span>• Capacidad: 2 Personas</span>
                    <span>• Cama: Queen Size</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a0533] border border-[#9B00CC]/20 rounded-3xl p-6 flex flex-col md:flex-row gap-6 hover:border-[#00C8D4]/40 transition-colors">
                <img 
                  src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&auto=format&fit=crop" 
                  alt="Habitación Familiar"
                  className="w-full md:w-48 h-32 object-cover rounded-2xl border border-white/5"
                />
                <div className="space-y-2 flex-grow">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold font-serif text-white">Apartamento Familiar Premium</h4>
                    <span className="text-xs font-black text-[#00C8D4] bg-[#00C8D4]/10 px-3 py-1 rounded-full">$130 USD / Noche</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Ideal para familias grandes. Equipado con sala de estar, cocina completa, comedor y dos baños independientes.
                  </p>
                  <div className="flex gap-4 text-[10px] text-slate-500 font-semibold uppercase">
                    <span>• Capacidad: 5 Personas</span>
                    <span>• Cama: 1 King + 2 Twin</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de reservas */}
          <div className="lg:col-span-5">
            <BookingForm />
          </div>

        </div>
      </section>

      {/* Sección de Cierre corporativa oficial */}
      <BottomCTA />

    </div>
  );
}
