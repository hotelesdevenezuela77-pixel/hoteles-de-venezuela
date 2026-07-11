import React, { useState } from "react";
import { useTenant } from "../tenantContext";
import { GradientHeader } from "../components/GradientHeader";
import { BookingForm } from "./components/BookingForm";
import { POSModule } from "./components/POSModule";
import { BottomCTA } from "../components/BottomCTA";
import { 
  Sparkles, ShieldCheck, Compass, Anchor, Gift, Coffee, 
  MapPin, Check, Star 
} from "lucide-react";

// Importación de módulos PMS & CMS
import { TaskModule } from "./components/TaskModule";
import { FinanceModule } from "./components/FinanceModule";
import { CMSModule } from "./components/CMSModule";
import { AnalyticsModule } from "./components/AnalyticsModule";

export function TemplateB() {
  const { config, updateConfig } = useTenant();

  // Estados del Portal del Staff
  const [showStaffPanel, setShowStaffPanel] = useState(false);
  const [staffPassword, setStaffPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"tareas" | "finanzas" | "cms" | "analiticas">("cms");

  // Mapeo de iconos para servicios premium (cajas de fondo sólido de color con SVG blanco puro)
  const premiumServices = [
    { icon: <Anchor className="w-5 h-5 text-white" />, label: "Marina Privada y Yates", bg: "bg-[#00C8D4]" },
    { icon: <Sparkles className="w-5 h-5 text-white" />, label: "Mayordomo Personal 24h", bg: "bg-[#FF0096]" },
    { icon: <Gift className="w-5 h-5 text-white" />, label: "Experiencia VIP All-Inclusive", bg: "bg-[#9B00CC]" },
  ];

  return (
    <div className="min-h-screen bg-[#0e011f] text-slate-100 selection:bg-[#00C8D4] selection:text-[#0e011f]">
      
      {/* 1. Cabecera dinámica responsiva (AGENTS.md) */}
      <GradientHeader 
        preTitle="COMPLEJO PREMIUM & CLUB DE PLAYA"
        subtitle="Un ecosistema exclusivo de alta gama gestionado por el Core de Hoteles de Venezuela."
      />

      {/* 2. Sección: Filosofía de Lujo */}
      <section id="inicio" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[10px] tracking-[0.3em] font-extrabold text-[#FF0096] uppercase block">
              ALTA GAMA EN EL CARIBE VENEZOLANO
            </span>
            <h2 className="text-4xl md:text-5xl font-black font-serif text-white leading-tight">
              Bienvenido al Santuario de <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C8D4] via-[#FF0096] to-[#9B00CC]">
                {config.name}
              </span>
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed font-light">
              Nuestra filosofía es redefinir el lujo a través del servicio hiper-personalizado y la privacidad total. Disfrute de suites de diseño arquitectónico vanguardista, cocina gourmet curada por chefs galardonados y aventuras exclusivas organizadas por nuestro equipo de conserjería premium.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="border-l-2 border-[#00C8D4] pl-4">
                <span className="text-xs text-slate-400 block mb-1">Alojamiento</span>
                <span className="text-sm font-bold text-white">Suites de Autor</span>
              </div>
              <div className="border-l-2 border-[#FF0096] pl-4">
                <span className="text-xs text-slate-400 block mb-1">Gastronomía</span>
                <span className="text-sm font-bold text-white">Experiencia POS Integrada</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden border border-[#FF0096]/20 p-2 bg-gradient-to-tr from-[#9B00CC]/30 via-[#0e011f] to-[#00C8D4]/30 shadow-2xl">
              <div className="relative rounded-2xl overflow-hidden h-[400px]">
                <img 
                  src={config.branding.banner_url} 
                  alt={config.name}
                  className="w-full h-full object-cover scale-[1.08] hover:scale-100 transition-transform duration-[8s]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e011f] via-[#0e011f]/20 to-transparent"></div>
                
                <div className="absolute top-4 right-4 bg-[#FF0096] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                  Recomendado HDV
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Sección: Club POS Integrado (Consumos del Huésped) */}
      <section id="pos" className="py-20 bg-[#1a0533]/30 border-y border-[#9B00CC]/15 px-6">
        <div className="max-w-7xl mx-auto">
          <POSModule />
        </div>
      </section>

      {/* 4. Sección: Experiencias VIP y Marina */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[10px] tracking-[0.25em] font-extrabold text-[#00C8D4] uppercase block">
            EXPERIENCIAS CURADAS
          </span>
          <h3 className="text-3xl font-black font-serif text-white">Servicios y Áreas de Alta Gama</h3>
          <p className="text-slate-400 text-xs">
            Cada servicio ha sido estructurado para ofrecer el máximo confort y exclusividad a nuestros miembros distinguidos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {premiumServices.map((service, index) => (
            <div 
              key={index}
              className="bg-[#1a0533] border border-[#9B00CC]/10 hover:border-[#FF0096]/40 rounded-3xl p-8 hover:scale-102 transition-all duration-300 flex flex-col items-center text-center space-y-4"
            >
              {/* Caja sólida de color con vector SVG en blanco por dentro */}
              <div className={`p-4 rounded-2xl ${service.bg} flex items-center justify-center shadow-lg shadow-black/35`}>
                {service.icon}
              </div>
              <h4 className="text-sm font-bold tracking-wider text-slate-200">{service.label}</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Acceso exclusivo y reservado a través de nuestro concierge digital con cargos directos a su cuenta multi-tenant.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Sección: Alojamiento VIP y Reservas */}
      <section id="habitaciones" className="py-20 bg-[#0c001a] px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Suites de Lujo */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <span className="text-[10px] tracking-[0.25em] font-extrabold text-[#00C8D4] uppercase block mb-2">
                HOSPEDAJE EXCLUSIVO
              </span>
              <h3 className="text-3xl font-black font-serif text-white">Suites y Villas de Ensueño</h3>
              <p className="text-slate-400 text-xs mt-2">
                Diseñadas con materiales autóctonos y equipadas con automatización inteligente de vanguardia.
              </p>
            </div>

            {/* Listado de Suites Premium */}
            <div className="space-y-6">
              <div className="bg-[#1a0533] border border-[#FF0096]/15 rounded-3xl p-6 flex flex-col md:flex-row gap-6 hover:border-[#00C8D4] transition-colors duration-300">
                <div className="relative shrink-0 md:w-56 h-36 rounded-2xl overflow-hidden border border-white/5">
                  <img 
                    src="https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&auto=format&fit=crop" 
                    alt="Bungalow VIP" 
                    className="w-full h-full object-cover scale-[1.08]"
                  />
                  <div className="absolute top-2 left-2 bg-[#FF0096] text-[8px] font-extrabold uppercase px-2 py-0.5 rounded text-white tracking-widest">
                    RECOMENDADO
                  </div>
                </div>
                <div className="space-y-2 flex-grow">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold font-serif text-white">Bungalow sobre el Agua VIP</h4>
                    <span className="text-xs font-black text-[#00C8D4] bg-[#00C8D4]/10 px-3 py-1 rounded-full">$350 / Noche</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Bungalow exclusivo flotante con piso de cristal templado para ver el arrecife, piscina infinity privada, terraza panorámica y mayordomo personal.
                  </p>
                  <div className="flex gap-4 text-[9px] text-slate-500 font-semibold uppercase">
                    <span>• Capacidad: 2 Personas</span>
                    <span>• Mayordomo VIP</span>
                    <span>• Jacuzzi Exterior</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a0533] border border-[#FF0096]/15 rounded-3xl p-6 flex flex-col md:flex-row gap-6 hover:border-[#00C8D4] transition-colors duration-300">
                <div className="relative shrink-0 md:w-56 h-36 rounded-2xl overflow-hidden border border-white/5">
                  <img 
                    src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop" 
                    alt="Oceanfront Villa" 
                    className="w-full h-full object-cover scale-[1.08]"
                  />
                </div>
                <div className="space-y-2 flex-grow">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold font-serif text-white">Oceanfront Premium Villa</h4>
                    <span className="text-xs font-black text-[#00C8D4] bg-[#00C8D4]/10 px-3 py-1 rounded-full">$520 / Noche</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Villa de dos niveles al borde del arrecife, cocina gourmet de chef, spa privado, piscina de borde infinito y acceso a playa privada exclusiva.
                  </p>
                  <div className="flex gap-4 text-[9px] text-slate-500 font-semibold uppercase">
                    <span>• Capacidad: 6 Personas</span>
                    <span>• Cocina Completa</span>
                    <span>• Playa Privada</span>
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

      {/* ── CONSOLA OPERATIVA (PORTAL STAFF PMS/CMS) ── */}
      <div className="py-10 bg-[#0b0c10] border-t border-white/5 text-center">
        {!showStaffPanel ? (
          <button
            onClick={() => {
              setShowStaffPanel(true);
              const m = config.modules;
              if (m.cms) setActiveTab("cms");
              else if (m.tareas) setActiveTab("tareas");
              else if (m.finanzas) setActiveTab("finanzas");
              else if (m.analiticas) setActiveTab("analiticas");
            }}
            className="text-[10px] uppercase font-bold tracking-widest text-[#00C8D4] hover:text-white transition-colors duration-200 cursor-pointer"
          >
            Consola Operativa (Portal Staff)
          </button>
        ) : (
          <div className="max-w-4xl mx-auto px-6 space-y-6 text-left">
            
            {!isAuthorized ? (
              <div className="max-w-md mx-auto bg-[#121620] border border-white/10 p-6 rounded-3xl space-y-4 shadow-xl">
                <div className="text-center">
                  <h4 className="text-sm font-bold text-white font-serif uppercase tracking-wider">Acceso Staff PMS/CMS</h4>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Introduce la clave de la posada</p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Clave (Default: admin123)"
                    value={staffPassword}
                    onChange={e => setStaffPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                  <button
                    onClick={() => {
                      if (staffPassword === "admin123" || staffPassword === String(config.establishment_id)) {
                        setIsAuthorized(true);
                      } else {
                        alert("Clave incorrecta.");
                      }
                    }}
                    className="bg-[#00C8D4] text-[#0b0c10] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                  >
                    Entrar
                  </button>
                </div>
                <div className="text-center">
                  <button 
                    onClick={() => setShowStaffPanel(false)}
                    className="text-[9px] uppercase font-extrabold text-gray-500 hover:text-white cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FF0096] animate-ping shrink-0"></span>
                    <h4 className="text-sm font-black font-serif text-white uppercase tracking-wider">Consola Operativa: {config.name}</h4>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {config.modules.cms && (
                      <button
                        onClick={() => setActiveTab("cms")}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          activeTab === "cms" ? "bg-[#FF0096] text-white" : "bg-white/5 text-gray-400 hover:text-white"
                        }`}
                      >
                        CMS Web
                      </button>
                    )}
                    {config.modules.tareas && (
                      <button
                        onClick={() => setActiveTab("tareas")}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          activeTab === "tareas" ? "bg-[#9B00CC] text-white" : "bg-white/5 text-gray-400 hover:text-white"
                        }`}
                      >
                        Tareas
                      </button>
                    )}
                    {config.modules.finanzas && (
                      <button
                        onClick={() => setActiveTab("finanzas")}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          activeTab === "finanzas" ? "bg-[#00C8D4] text-[#0b0c10]" : "bg-white/5 text-gray-400 hover:text-white"
                        }`}
                      >
                        Finanzas
                      </button>
                    )}
                    {config.modules.analiticas && (
                      <button
                        onClick={() => setActiveTab("analiticas")}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          activeTab === "analiticas" ? "bg-indigo-600 text-white" : "bg-white/5 text-gray-400 hover:text-white"
                        }`}
                      >
                        Estadísticas
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsAuthorized(false);
                        setShowStaffPanel(false);
                        setStaffPassword("");
                      }}
                      className="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-white/5 text-gray-400 hover:text-white cursor-pointer"
                    >
                      Salir
                    </button>
                  </div>
                </div>

                <div className="animate-fade-in">
                  {activeTab === "cms" && config.modules.cms && (
                    <CMSModule 
                      config={config} 
                      onConfigChange={updateConfig} 
                      primaryColor={config.branding.primary_color}
                      secondaryColor={config.branding.secondary_color}
                      accentColor={config.branding.accent_color}
                    />
                  )}
                  {activeTab === "tareas" && config.modules.tareas && (
                    <TaskModule 
                      establishmentId={config.establishment_id}
                      primaryColor={config.branding.primary_color}
                      secondaryColor={config.branding.secondary_color}
                      accentColor={config.branding.accent_color}
                    />
                  )}
                  {activeTab === "finanzas" && config.modules.finanzas && (
                    <FinanceModule 
                      establishmentId={config.establishment_id}
                      primaryColor={config.branding.primary_color}
                      secondaryColor={config.branding.secondary_color}
                      accentColor={config.branding.accent_color}
                    />
                  )}
                  {activeTab === "analiticas" && config.modules.analiticas && (
                    <AnalyticsModule 
                      establishmentId={config.establishment_id}
                      primaryColor={config.branding.primary_color}
                      secondaryColor={config.branding.secondary_color}
                      accentColor={config.branding.accent_color}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. Sección de Cierre unificada (AGENTS.md) */}
      <BottomCTA />

    </div>
  );
}
