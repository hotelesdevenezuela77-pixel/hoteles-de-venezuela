import React, { useState } from "react";
import { useTenant } from "../tenantContext";
import { GradientHeader } from "../components/GradientHeader";
import { BookingForm } from "./components/BookingForm";
import { BottomCTA } from "../components/BottomCTA";
import { Wifi, Shield, ShieldAlert, Award, Star, MapPin } from "lucide-react";

// Importación de módulos PMS & CMS
import { TaskModule } from "./components/TaskModule";
import { FinanceModule } from "./components/FinanceModule";
import { CMSModule } from "./components/CMSModule";
import { AnalyticsModule } from "./components/AnalyticsModule";

export function TemplateA() {
  const { config, updateConfig } = useTenant();

  // Estados del Portal del Staff
  const [showStaffPanel, setShowStaffPanel] = useState(false);
  const [staffPassword, setStaffPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"tareas" | "finanzas" | "cms" | "analiticas">("cms");

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

      {/* Sección de Cierre corporativa oficial */}
      <BottomCTA />

    </div>
  );
}
