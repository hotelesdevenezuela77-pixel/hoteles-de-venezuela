import React, { useState } from "react";
import {
  Building2, Compass, Waves, Car, Utensils, Anchor,
  Ship, Camera, Eye, Sparkles, Layers, CheckCircle2,
  Maximize2, Minimize2, Info, ArrowRight, ShieldCheck,
  Zap, HelpCircle, Laptop, SlidersHorizontal, RefreshCw,
  ExternalLink, FileCode, Users, DollarSign, Calendar
} from "lucide-react";
import { AgencyDashboard } from "@/components/agency/AgencyDashboard";
import { ParkComplexDashboard } from "@/components/park/ParkComplexDashboard";
import { CreatorDashboard } from "@/components/creator/CreatorDashboard";
import { RestaurantDashboard } from "@/components/restaurant/RestaurantDashboard";
import { MarinaDashboard } from "@/components/marina/MarinaDashboard";
import { CarRentalDashboard } from "@/components/car_rental/CarRentalDashboard";
import { YachtCharterDashboard } from "@/components/yacht_charter/YachtCharterDashboard";
import { ConstellationBackground } from "@/components/ConstellationBackground";

interface DashboardAlfaMeta {
  id: string;
  title: string;
  shortName: string;
  categoryCodes: string;
  icon: React.ComponentType<any>;
  badgeColor: string;
  accentColor: string;
  targetIndustry: string;
  demoEstablishment: {
    id: number;
    name: string;
    slug: string;
    category_name: string;
  };
  keyFeatures: string[];
  businessLogicSummary: string;
  documentCategory: string;
}

const DASHBOARDS_ALFA_REGISTRY: DashboardAlfaMeta[] = [
  {
    id: "hotel",
    title: "1. Suite Hotelera, Posadas, Casas & Campings (PMS)",
    shortName: "Hoteles & Posadas",
    categoryCodes: "C00.1.1 a C00.1.15",
    icon: Building2,
    badgeColor: "bg-[#FF0096]/20 text-[#FF0096] border-[#FF0096]/30",
    accentColor: "#FF0096",
    targetIndustry: "Hoteles, Posadas, Apartahoteles, Villas, Glampings & Eco-Lodges",
    demoEstablishment: {
      id: 101,
      name: "Hotel Boutique Humboldt Caracas",
      slug: "hotel-humboldt",
      category_name: "Hoteles & Posadas"
    },
    keyFeatures: [
      "Motor de Reservas en Tiempo Real con Calendario Drag & Drop",
      "Channel Manager & Modificador Masivo de Tarifas",
      "Inventario de Habitaciones y Unidades Glamping (Botón 3)",
      "Club POS para Restaurante y Bar interno",
      "CMS Web Builder para Ficha Pública y Landing Page"
    ],
    businessLogicSummary: "Gestión centralizada de alojamiento tradicional y alternativo. Permite a los dueños configurar tarifas por temporada, recibir reservas directas, gestionar limpieza y sincronizar calendarios.",
    documentCategory: "DOC 77 V10: C00.1 Tipos de Alojamiento (Hoteles, Apartamentos, Villas, Chalets, Glampings C04.1.1)"
  },
  {
    id: "agency",
    title: "2. Suite para Agencias de Viajes & Tour Operadores (DMC)",
    shortName: "Agencias & DMC",
    categoryCodes: "C05.1.18",
    icon: Compass,
    badgeColor: "bg-[#9B00CC]/20 text-[#9B00CC] border-[#9B00CC]/30",
    accentColor: "#9B00CC",
    targetIndustry: "Agencias de Viajes, DMCs, Mayoristas & Tour Operadores",
    demoEstablishment: {
      id: 102,
      name: "Canaima Tours & Expediciones VIP DMC",
      slug: "canaima-tours-dmc",
      category_name: "Agencias de Viajes y Tour Operadores"
    },
    keyFeatures: [
      "Cotizador B2B Inteligente en USD con desglose de márgenes",
      "Gestor de Pasajeros (Pax) y expedientes de viaje con pasaportes",
      "Paquetes Turísticos Multidestino (Canaima, Los Roques, Roraima)",
      "Red de Proveedores Hoteleros y Traslados con liquidación",
      "Generador de Itinerarios en PDF para clientes"
    ],
    businessLogicSummary: "Herramienta especializada para intermediación turística. Permite armar presupuestos complejos, gestionar comisiones y coordinar logística de grupos sin inventario propio de habitaciones.",
    documentCategory: "DOC 77 V10: C05.1.18 Agencias de Viaje"
  },
  {
    id: "park",
    title: "3. Suite para Parques Acuáticos & Complejos Recreativos",
    shortName: "Parques Acuáticos",
    categoryCodes: "C00.1.17",
    icon: Waves,
    badgeColor: "bg-[#00C8D4]/20 text-[#00C8D4] border-[#00C8D4]/30",
    accentColor: "#00C8D4",
    targetIndustry: "Parques Acuáticos, Balnearios, Parques Temáticos y Centros Recreativos",
    demoEstablishment: {
      id: 103,
      name: "Parque Acuático El Agua / Mundo de los Niños",
      slug: "parque-el-agua",
      category_name: "Complejos Turísticos y Parques Acuáticos"
    },
    keyFeatures: [
      "Taquilla Rápida con emisión y escaneo de brazaletes QR",
      "Monitor de Aforo en Vivo para Piscinas de Olas y Toboganes",
      "Alquiler de Botes a Pedal, Kayaks y Flotadores",
      "Control de Consumos por Zonas (Chiringuitos, Kioscos y Souvenirs)",
      "Historial de Pases Diarios y Paquetes Familiares"
    ],
    businessLogicSummary: "Control de alto flujo de visitantes diurnos con tickets por categorías de edad (Adulto, Niño, Tercera Edad), seguridad en atracciones acuáticas y venta de comidas/bebidas en tiempo real.",
    documentCategory: "DOC 77 V10: C00.1.17 Parques Acuáticos y Recreativos"
  },
  {
    id: "car_rental",
    title: "4. Suite para Alquiler de Carros (Rent-a-Car & Flotas)",
    shortName: "Rent-a-Car & Flota",
    categoryCodes: "C05.1.19",
    icon: Car,
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    accentColor: "#00C8D4",
    targetIndustry: "Empresas de Alquiler de Carros, Flotas 4x4, Transfers VIP y Furgonetas",
    demoEstablishment: {
      id: 104,
      name: "Venezuela Express Rent-a-Car & 4x4 Flota",
      slug: "venezuela-express-rentacar",
      category_name: "Alquiler de Carros y Flotas"
    },
    keyFeatures: [
      "Matriz de Disponibilidad de Flota (Sedanes, SUVs, 4x4 Rústicos, Vans)",
      "Control de Entrega/Recepción: Odómetro (km) y Fracción de Combustible (1/8 a 8/8)",
      "Generador de Contratos de Alquiler con Licencias y Garantías",
      "Monitor de Pólizas de Seguro, Mantenimiento y Cambios de Aceite",
      "Tarifario Dinámico Diario, Semanal y Mensual"
    ],
    businessLogicSummary: "Gestión de vehículos por matrícula, kilometraje de salida/retorno, inspección de carrocería, depósitos de garantía con tarjeta y seguimiento preventivo de mantenimiento.",
    documentCategory: "DOC 77 V10: C05.1.19 Alquiler de Carros"
  },
  {
    id: "restaurant",
    title: "5. Suite para Restaurantes, Beach Clubs & Gastronomía",
    shortName: "Restaurantes & Bares",
    categoryCodes: "C00.1.16",
    icon: Utensils,
    badgeColor: "bg-[#FF0096]/20 text-[#FF0096] border-[#FF0096]/30",
    accentColor: "#FF0096",
    targetIndustry: "Restaurantes, Beach Clubs, Bares, Cafés Gourmet y Casas de Degustación",
    demoEstablishment: {
      id: 105,
      name: "Restaurante & Beach Club Bahía Los Juanes",
      slug: "bahia-los-juanes-club",
      category_name: "Restaurantes y Gastronomía"
    },
    keyFeatures: [
      "Mapa Interactivo de Mesas en Vivo (Libre, Ocupada, Reservada, Facturando)",
      "Pantalla de Comandas de Cocina (KDS) en tiempo real con tiempos de preparación",
      "Menú Digital con Códigos QR, fotos, alérgenos y precios USD",
      "Libro de Reservas de Mesas y Áreas VIP / Camas Balinesas",
      "Control de Cuentas, Propinas y Cierre de Caja POS"
    ],
    businessLogicSummary: "Operación de servicio gastronómico con flujo de salón a cocina (KDS), pedidos digitales vía QR desde la mesa o tumbona de playa, y rotación eficiente de comensales.",
    documentCategory: "DOC 77 V10: C00.1.16 Restaurantes"
  },
  {
    id: "marina",
    title: "6. Suite para Marinas, Muelles & Clubes Náuticos",
    shortName: "Marinas & Muelles",
    categoryCodes: "C05.1.20",
    icon: Anchor,
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    accentColor: "#00C8D4",
    targetIndustry: "Marinas Turísticas, Marinas Secas, Muelles Deportivos y Clubes Náuticos",
    demoEstablishment: {
      id: 106,
      name: "Gran Marina & Club Náutico Los Roques / Lechería",
      slug: "gran-marina-nautica",
      category_name: "Marinas y Clubes Náuticos"
    },
    keyFeatures: [
      "Pantalanes & Slips Húmedos con control de eslora, manga y calado",
      "Marina Seca (Dry Stack Racks) y Operaciones de Travelift 50T",
      "Suministro de Combustible Marino (Diésel y Gasolina 95 sin plomo)",
      "Torre de Control VTS con Capitanía e INEA en VHF Canal 16/68",
      "Estación Meteorológica en Vivo y Cotizador de Amarre por Pie"
    ],
    businessLogicSummary: "Administración de infraestructura portuaria para resguardo y atraque de embarcaciones de socios y tránsitos, varadero técnico, bunkering de combustible y servicios de club house.",
    documentCategory: "DOC 77 V10: C05.1.20 Marinas"
  },
  {
    id: "yacht_charter",
    title: "7. Suite para Empresas de Alquiler de Yates & Embarcaciones",
    shortName: "Charter de Yates",
    categoryCodes: "C00.1.15 / Charter",
    icon: Ship,
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    accentColor: "#00C8D4",
    targetIndustry: "Empresas de Charter Náutico, Armadores Comerciales y Veleros Turísticos",
    demoEstablishment: {
      id: 107,
      name: "Caribe Queen Yacht Charter & Catamaranes",
      slug: "caribe-queen-charters",
      category_name: "Alquiler de Yates y Embarcaciones"
    },
    keyFeatures: [
      "Flota de Yates, Lanchas y Catamaranes con tarifas Full Day, Por Horas y Pernoctas",
      "Generador Oficial de Manifiestos de Pasajeros y Despachos INEA",
      "Gestión de Tripulación Certificada (Capitanes con licencia, Marineros, Chefs)",
      "Inventario de Amenidades (Sonido JL Audio, Cavas de Hielo) y Juguetes Náuticos (SUP, Snorkel)",
      "Catálogo de Rutas Náuticas de Venezuela (Morrocoy, Mochima, Los Roques, Tortuga)"
    ],
    businessLogicSummary: "Comercialización de paseos marítimos y expediciones en barco para turistas. Enfoque en itinerarios a cayos, tripulación a bordo, seguridad acuática y normativa legal de navegación.",
    documentCategory: "DOC 77 V10: C00.1.15 Barcos (veleros, yates, catamaranes o houseboats)"
  },
  {
    id: "creator",
    title: "8. Desk Hub para Creadores de Contenido & Influencers",
    shortName: "Creadores & Embajadores",
    categoryCodes: "C00.1.21",
    icon: Camera,
    badgeColor: "bg-[#FF0096]/20 text-[#FF0096] border-[#FF0096]/30",
    accentColor: "#FF0096",
    targetIndustry: "Creadores de Contenido Turístico, Fotógrafos de Viajes y Embajadores HDV",
    demoEstablishment: {
      id: 108,
      name: "Aura Croce · Desk Hub Creadora Oficial",
      slug: "aura-croce-creator",
      category_name: "Creadores de Contenido / Influencers"
    },
    keyFeatures: [
      "Gestor de Expediciones Satelitales y Coberturas en Destinos",
      "Módulo de Canjes B2B y Colaboraciones con Hoteles y Posadas",
      "Auditoría de Métricas de Redes Sociales (Instagram, TikTok, YouTube)",
      "Bitácora de Viaje y Producción Multimedia con links verificados",
      "Pasaporte Digital de Creador HDV con insignias de verificación"
    ],
    businessLogicSummary: "Consola de trabajo para influencers del ecosistema. Permite formalizar acuerdos de canje con establecimientos, documentar rutas y validar impacto publicitario con métricas auditadas.",
    documentCategory: "Nuevas Directrices: Creadores de Contenido Turístico y Desk Hub"
  }
];

export function AdminDashboardsAlfa() {
  const [selectedDashboardId, setSelectedDashboardId] = useState<string>("hotel");
  const [viewMode, setViewMode] = useState<"specs" | "live_preview">("live_preview");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const selectedDashboard = DASHBOARDS_ALFA_REGISTRY.find(d => d.id === selectedDashboardId) || DASHBOARDS_ALFA_REGISTRY[0];
  const IconComponent = selectedDashboard.icon;

  return (
    <div className="space-y-6 text-slate-800 font-sans pb-20">
      {/* Hero Header Corporativo */}
      <div className="bg-gradient-to-r from-[#0e011f] via-[#1a0533] to-[#0a192f] text-white p-6 md:p-8 rounded-3xl shadow-xl border border-white/10 relative overflow-hidden">
        <ConstellationBackground />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C8D4]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#FF0096]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] text-slate-950 shadow-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  MÓDULO EXCLUSIVO DE ARQUITECTURA & SUPERADMIN
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white border border-white/20">
                  8 Suites Especializadas
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight font-serif text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#00C8D4] flex items-center justify-center text-slate-950 shadow-lg">
                  <Layers className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span>Dashboards Alfa HDV</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
                Consola maestra para contemplar, inspeccionar y previsualizar en vivo todos los tipos de dashboards de la plataforma *Hoteles de Venezuela*. Diseñada para que el super-administrador y su equipo asistente evalúen la arquitectura completa de cada modelo de negocio.
              </p>
            </div>

            {/* Switch de Modo Specs vs Live Preview */}
            <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10 shrink-0">
              <button
                onClick={() => setViewMode("live_preview")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  viewMode === "live_preview"
                    ? "bg-[#00C8D4] text-slate-950 shadow-md"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Preview Interactivo en Vivo</span>
              </button>
              <button
                onClick={() => setViewMode("specs")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  viewMode === "specs"
                    ? "bg-[#FF0096] text-white shadow-md"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Info className="w-4 h-4" />
                <span>Ficha Técnica & Arquitectura</span>
              </button>
            </div>
          </div>

          {/* Grid Selector de Dashboards Alfa */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-4 border-t border-white/10">
            {DASHBOARDS_ALFA_REGISTRY.map((dash, index) => {
              const active = selectedDashboardId === dash.id;
              const DashIcon = dash.icon;
              return (
                <button
                  key={dash.id}
                  onClick={() => setSelectedDashboardId(dash.id)}
                  className={`flex flex-col items-center text-center p-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer border ${
                    active
                      ? "bg-white text-slate-950 border-white shadow-xl scale-[1.03] font-black"
                      : "bg-white/5 hover:bg-white/10 text-white/90 border-white/10"
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center mb-1.5 shadow-sm"
                    style={{
                      background: active ? "#0e011f" : "rgba(255, 255, 255, 0.1)",
                      color: active ? dash.accentColor : "#ffffff"
                    }}
                  >
                    <DashIcon className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="text-[11px] leading-tight line-clamp-1">{dash.shortName}</span>
                  <span className="text-[9px] text-slate-400 mt-0.5">{dash.categoryCodes.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* DETALLES DEL DASHBOARD SELECCIONADO */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md"
            style={{ background: selectedDashboard.accentColor }}
          >
            <IconComponent className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${selectedDashboard.badgeColor}`}>
                {selectedDashboard.categoryCodes}
              </span>
              <span className="text-xs font-bold text-slate-500">• {selectedDashboard.targetIndustry}</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 font-serif mt-0.5">{selectedDashboard.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
            Establecimiento Demo: <strong className="text-slate-900">{selectedDashboard.demoEstablishment.name}</strong>
          </span>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
            title={isFullscreen ? "Salir de pantalla completa" : "Ver en pantalla completa"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* MODO 1: LIVE INTERACTIVE PREVIEW */}
      {viewMode === "live_preview" && (
        <div className={`transition-all ${isFullscreen ? "fixed inset-0 z-50 bg-slate-900 p-6 overflow-y-auto" : "space-y-6"}`}>
          {isFullscreen && (
            <div className="flex items-center justify-between mb-4 bg-slate-950 p-4 rounded-2xl border border-white/10 text-white">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-black uppercase">Simulador Pantalla Completa · {selectedDashboard.title}</span>
              </div>
              <button
                onClick={() => setIsFullscreen(false)}
                className="px-4 py-1.5 bg-[#FF0096] text-white rounded-xl text-xs font-black cursor-pointer"
              >
                Cerrar Pantalla Completa
              </button>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            {selectedDashboard.id === "hotel" ? (
              <div className="space-y-6 text-center py-12">
                <div className="w-16 h-16 rounded-3xl bg-[#FF0096] text-white flex items-center justify-center mx-auto shadow-xl">
                  <Building2 className="w-8 h-8 stroke-[2.5]" />
                </div>
                <div className="max-w-xl mx-auto space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 font-serif">Suite Hotelera & PMS Tradicional</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Este dashboard incluye las pestañas clásicas de control de inventario de habitaciones, tarifario masivo, calendario de disponibilidad, timeline PMS con drag & drop, CMS Web Builder y Club POS.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left text-xs">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <strong className="text-slate-900 block">📅 Calendario Pro & Tarifas</strong>
                    <p className="text-slate-500 text-[11px]">Modificador masivo de precios por temporada y canal.</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <strong className="text-slate-900 block">🛏️ Inventario Habitaciones</strong>
                    <p className="text-slate-500 text-[11px]">Configuración de camas, amenidades y unidades operativas.</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <strong className="text-slate-900 block">☕ Club POS Gastronómico</strong>
                    <p className="text-slate-500 text-[11px]">Manejo de cuentas y comandas para huéspedes internos.</p>
                  </div>
                </div>
              </div>
            ) : selectedDashboard.id === "agency" ? (
              <AgencyDashboard
                establishment={selectedDashboard.demoEstablishment as any}
                onSwitchToTraditionalDashboard={() => alert("Simulación: Regresar al Dashboard Matriz")}
              />
            ) : selectedDashboard.id === "park" ? (
              <ParkComplexDashboard
                establishment={selectedDashboard.demoEstablishment as any}
                onSwitchToTraditionalDashboard={() => alert("Simulación: Regresar al Dashboard Matriz")}
              />
            ) : selectedDashboard.id === "car_rental" ? (
              <CarRentalDashboard
                establishment={selectedDashboard.demoEstablishment as any}
                onSwitchToTraditionalDashboard={() => alert("Simulación: Regresar al Dashboard Matriz")}
              />
            ) : selectedDashboard.id === "restaurant" ? (
              <RestaurantDashboard
                establishment={selectedDashboard.demoEstablishment as any}
                onSwitchToTraditionalDashboard={() => alert("Simulación: Regresar al Dashboard Matriz")}
              />
            ) : selectedDashboard.id === "marina" ? (
              <MarinaDashboard
                establishment={selectedDashboard.demoEstablishment as any}
                onSwitchToTraditionalDashboard={() => alert("Simulación: Regresar al Dashboard Matriz")}
              />
            ) : selectedDashboard.id === "yacht_charter" ? (
              <YachtCharterDashboard
                establishment={selectedDashboard.demoEstablishment as any}
                onSwitchToTraditionalDashboard={() => alert("Simulación: Regresar al Dashboard Matriz")}
              />
            ) : (
              <CreatorDashboard
                establishment={selectedDashboard.demoEstablishment as any}
                onSwitchToTraditionalDashboard={() => alert("Simulación: Regresar al Dashboard Matriz")}
              />
            )}
          </div>
        </div>
      )}

      {/* MODO 2: FICHA TÉCNICA & ARQUITECTURA */}
      {viewMode === "specs" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Resumen del Negocio y Lógica */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Lógica del Negocio & Propósito</span>
                <h3 className="text-xl font-black text-slate-900 font-serif mt-1">
                  {selectedDashboard.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-2 font-medium">
                  {selectedDashboard.businessLogicSummary}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Características & Módulos Clave:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedDashboard.keyFeatures.map((feat, i) => (
                    <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-slate-700">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-900 space-y-1">
                <strong className="block font-black uppercase tracking-wider text-[10px]">Correspondencia Documento Oficial:</strong>
                <p className="font-mono font-bold text-[11px]">{selectedDashboard.documentCategory}</p>
              </div>
            </div>

            {/* Tarjeta Lateral de Configuración y Permisos */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-[#0e011f] to-[#1a0533] text-white p-6 rounded-3xl shadow-md border border-white/10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00C8D4] flex items-center justify-center text-slate-950 font-black">
                    <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-white">Aislamiento & Permisos</h4>
                    <p className="text-[10px] text-slate-300">Reglas de Seguridad HDV</p>
                  </div>
                </div>

                <div className="text-xs text-slate-300 space-y-2 border-t border-white/10 pt-3">
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00C8D4]" />
                    <span>Solo visible para el propietario del establecimiento.</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FF0096]" />
                    <span>El propietario no accede al admin principal de HDV.</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Super-Admin asiste desde <em>Asistencia Propietario</em>.</span>
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
                <h4 className="font-black text-xs uppercase tracking-wider text-slate-400">Acción de Asistente</h4>
                <button
                  onClick={() => setViewMode("live_preview")}
                  className="w-full py-3 bg-[#0e011f] hover:bg-[#1a0533] text-white font-black text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <Eye className="w-4 h-4 text-[#00C8D4]" />
                  <span>Probar en el Sandbox en Vivo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
