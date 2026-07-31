import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { 
  Settings, Check, Plus, Loader2, 
  Sparkles, Building2, MapPin, Map as MapIcon, 
  Globe, Briefcase, Package, Ticket,
  Shield, Info, Mail, Phone as PhoneIcon, MessageSquare, Text, CreditCard
} from "lucide-react";

interface Setting {
  key: string;
  value: string;
}

const SETTING_LABELS: Record<string, string> = {
  maintenance_mode: "Modo Mantenimiento",
  site_name: "Nombre del Sitio",
  contact_email: "Email de Contacto",
  contact_phone: "Teléfono de Contacto",
  whatsapp_number: "WhatsApp Principal",
  footer_text: "Texto del Footer",
  facebook_url: "Facebook URL",
  instagram_url: "Instagram URL",
  twitter_url: "Twitter URL",
  
  // Métodos de Pago
  payment_pagomovil_bank: "Pago Móvil - Banco",
  payment_pagomovil_phone: "Pago Móvil - Teléfono",
  payment_pagomovil_rif: "Pago Móvil - RIF",
  payment_zelle_email: "Zelle - Correo",
  payment_zelle_holder: "Zelle - Titular",
  payment_usdt_binance_id: "USDT - Binance ID",
  payment_usdt_email: "USDT - Correo Binance",
  payment_paypal_email: "PayPal - Correo",
  payment_paypal_note: "PayPal - Nota",
  payment_stripe_info: "Stripe - Información / Instrucciones",
};

const SETTING_ICONS: Record<string, { icon: any; color: string }> = {
  maintenance_mode: { icon: Shield, color: "#EF4444" },
  site_name: { icon: Info, color: "#3B82F6" },
  contact_email: { icon: Mail, color: "#10B981" },
  contact_phone: { icon: PhoneIcon, color: "#F59E0B" },
  whatsapp_number: { icon: MessageSquare, color: "#25D366" },
  footer_text: { icon: Text, color: "#6B7280" },
  facebook_url: { icon: Globe, color: "#1877F2" },
  instagram_url: { icon: Globe, color: "#E1306C" },
  twitter_url: { icon: Globe, color: "#1DA1F2" },
  payment_pagomovil_bank: { icon: CreditCard, color: "#8B5CF6" },
  payment_pagomovil_phone: { icon: PhoneIcon, color: "#8B5CF6" },
  payment_pagomovil_rif: { icon: CreditCard, color: "#8B5CF6" },
  payment_zelle_email: { icon: Mail, color: "#F59E0B" },
  payment_zelle_holder: { icon: CreditCard, color: "#F59E0B" },
  payment_usdt_binance_id: { icon: CreditCard, color: "#F59E0B" },
  payment_usdt_email: { icon: Mail, color: "#F59E0B" },
  payment_paypal_email: { icon: Mail, color: "#003087" },
  payment_paypal_note: { icon: Info, color: "#003087" },
  payment_stripe_info: { icon: Info, color: "#635BFF" },
};

const MENU_SECTIONS = [
  { key: "MENU_SHOW_VIAJE_IA", label: "Planear con IA ✨", description: "Planificador inteligente basado en IA (consume tokens)", icon: Sparkles, color: "#FF0096" },
  { key: "MENU_SHOW_ESTABLECIMIENTOS", label: "Explorar", description: "Buscador y explorador de hoteles y posadas", icon: Building2, color: "#00C8D4" },
  { key: "MENU_SHOW_DESTINOS", label: "Destinos", description: "Guía de destinos y regiones turísticas", icon: MapPin, color: "#9B00CC" },
  { key: "MENU_SHOW_MAPA", label: "Mapa Interactivo", description: "Mapa de geolocalización de hoteles y servicios", icon: MapIcon, color: "#10B981" },
  { key: "MENU_SHOW_PARQUES", label: "Parques Nacionales", description: "Guía y detalles de parques nacionales", icon: Globe, color: "#3B82F6" },
  { key: "MENU_SHOW_SERVICIOS_B2B", label: "Marketplace B2B", description: "Directorio de servicios y negocios B2B", icon: Briefcase, color: "#F59E0B" },
  { key: "MENU_SHOW_PAQUETES", label: "Paquetes Turísticos", description: "Promociones y planes todo incluido", icon: Package, color: "#EF4444" },
  { key: "MENU_SHOW_MEMBRESIAS", label: "Membresías", description: "Información del club y planes de membresía", icon: Ticket, color: "#EC4899" },
];

export function AdminConfig() {
  const { user, profile, loading: authLoading } = navAuth();
  const [, nav] = useLocation();
  const qc = useQueryClient();
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [localVisibilities, setLocalVisibilities] = useState<Record<string, boolean>>({});

  function navAuth() {
    return useAuth();
  }

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      nav("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Query to fetch settings
  const { data: settings = [], isLoading: loadingSettings } = useQuery<Setting[]>({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value");
      if (error) throw error;
      
      const dbSettings = data || [];
      const dbMap = new Map<string, string>();
      dbSettings.forEach((s: any) => {
        dbMap.set(s.setting_key, s.setting_value);
      });

      // Ensure all predefined keys in SETTING_LABELS exist in the returned array
      const allKeys = Object.keys(SETTING_LABELS);
      const result = allKeys.map(key => ({
        key,
        value: dbMap.has(key) ? dbMap.get(key)! : ""
      }));

      // Add any other custom keys that are in the database but not in SETTING_LABELS
      dbSettings.forEach((s: any) => {
        if (!SETTING_LABELS[s.setting_key]) {
          result.push({
            key: s.setting_key,
            value: s.setting_value
          });
        }
      });

      return result;
    }
  });

  useEffect(() => {
    if (settings && settings.length > 0) {
      const vis: Record<string, boolean> = {};
      MENU_SECTIONS.forEach(item => {
        const config = settings.find(s => s && s.key && s.key.toUpperCase() === item.key.toUpperCase());
        vis[item.key] = config ? config.value !== "false" : true;
      });
      setLocalVisibilities(vis);
    }
  }, [settings]);

  // Mutation to update setting
  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from("site_settings")
        .upsert({
          setting_key: key,
          setting_value: value,
          setting_label: SETTING_LABELS[key] || key,
          setting_group: "general"
        }, { onConflict: "setting_key" });
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-settings"] });
      setEditKey(null);
      setSuccessMsg("¡Configuración guardada en la base de datos!");
      setTimeout(() => setSuccessMsg(null), 3000);
    },
    onError: (err: any) => {
      console.error("Error al actualizar ajuste:", err);
      setErrorMsg("Error al guardar en Supabase: " + (err.message || JSON.stringify(err)));
      setTimeout(() => setErrorMsg(null), 6000);
    }
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
        <p className="text-gray-500 text-xs font-bold">Verificando credenciales de seguridad...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 pb-24 font-sans">
      {/* Header */}
      <div className="relative overflow-hidden py-7" style={{ background: "linear-gradient(135deg, #0e0120, #1a0533)" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: "#FF0096" }} />
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-brand-magenta/20">
              <Settings className="w-4 h-4 text-brand-magenta" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Configuración del Sistema</h1>
              <p className="text-white/50 text-xs font-semibold">Configura variables globales de la plataforma y del sistema</p>
            </div>
          </div>
        </div>
      </div>

      <AdminTabBar />

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Notificaciones de Estado */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            {successMsg}
          </div>
        )}

        {/* Secciones del Menú Principal (Configuración Premium de Visibilidad) - AHORA ARRIBA */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-8 shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #0e011f 0%, #1a0533 100%)" }}>
            <div>
              <h2 className="font-bold text-white text-xs uppercase tracking-wider">Visibilidad del Menú Principal</h2>
              <p className="text-[10px] text-white/60 font-semibold mt-0.5">Controla la visualización de botones en la barra superior para optimizar tokens y navegación</p>
            </div>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {MENU_SECTIONS.map((item) => {
              const isActive = localVisibilities[item.key] !== false; // por defecto true
              const IconComponent = item.icon;
              const isPendingThis = updateSetting.isPending && updateSetting.variables?.key === item.key;

              return (
                <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200/80 hover:bg-slate-50/20 transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Caja de icono con fondo sólido y vector blanco */}
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: item.color }}
                    >
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                        {item.label}
                        {item.key.toUpperCase() === "MENU_SHOW_VIAJE_IA" && (
                          <span className="text-[8px] bg-pink-100 text-[#FF0096] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                            IA Tokens
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 font-semibold truncate max-w-[160px] sm:max-w-[200px]">{item.description}</div>
                    </div>
                  </div>
                  
                  {/* Switch Toggle iOS */}
                  <button
                    onClick={() => {
                      const currentActive = localVisibilities[item.key] !== false;
                      const nextValue = currentActive ? "false" : "true";
                      
                      // Actualización Optimista e Instantánea
                      setLocalVisibilities(prev => ({ ...prev, [item.key]: !currentActive }));
                      
                      updateSetting.mutate({ key: item.key, value: nextValue }, {
                        onError: () => {
                          // Revertir en caso de fallo
                          setLocalVisibilities(prev => ({ ...prev, [item.key]: currentActive }));
                        }
                      });
                    }}
                    disabled={updateSetting.isPending}
                    className={`w-10 h-5.5 flex items-center rounded-full p-0.5 cursor-pointer transition-all duration-300 relative ${
                      isActive ? "bg-[#FF0096]" : "bg-slate-200"
                    } ${isPendingThis ? "opacity-75 cursor-wait" : ""}`}
                  >
                    {isPendingThis ? (
                      <Loader2 className="w-3.5 h-3.5 text-white animate-spin mx-auto" />
                    ) : (
                      <div
                        className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-all duration-300 ${
                          isActive ? "translate-x-4.5" : "translate-x-0"
                        }`}
                      />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ajustes Generales (Remodelados con diseño premium ultra profesional) */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-8 shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Ajustes Generales del Sistema</h2>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Administra las variables de texto, contacto y enlaces oficiales de la plataforma</p>
            </div>
          </div>

          {loadingSettings ? (
            <div className="p-12 text-center flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-brand-magenta animate-spin" />
              <p className="text-gray-400 text-xs font-bold">Cargando variables del sistema...</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 bg-white">
              {settings.filter(s => s && s.key && !s.key.toUpperCase().startsWith("MENU_SHOW_")).map(s => {
                const configMeta = SETTING_ICONS[s.key] || { icon: Info, color: "#64748B" };
                const IconComp = configMeta.icon;
                const isMaintenance = s.key === "maintenance_mode";

                return (
                  <div key={s.key} className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/40 transition-colors">
                    <div className="flex items-start gap-4 min-w-0">
                      {/* Caja de icono premium */}
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: configMeta.color + "15", color: configMeta.color }}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                          {SETTING_LABELS[s.key] || s.key}
                          {isMaintenance && s.value === "true" && (
                            <span className="text-[8px] bg-red-100 text-red-600 font-black px-1.5 py-0.5 rounded-md tracking-wider">
                              ACTIVO
                            </span>
                          )}
                        </div>
                        
                        {editKey === s.key ? (
                          <div className="mt-2 w-full max-w-md">
                            <input 
                              value={editVal} 
                              onChange={e => setEditVal(e.target.value)} 
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta font-semibold transition-all" 
                            />
                          </div>
                        ) : (
                          <div className="mt-1 text-xs font-bold text-slate-500 truncate max-w-[280px] sm:max-w-[lg]">
                            {isMaintenance ? (
                              s.value === "true" ? (
                                <span className="text-red-500 font-black uppercase text-[10px]">El sitio web se encuentra en mantenimiento</span>
                              ) : (
                                <span className="text-emerald-600 font-black uppercase text-[10px]">Funcionamiento normal y visible</span>
                              )
                            ) : (
                              s.value || <span className="text-slate-300 font-normal italic">Sin configurar</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end shrink-0 gap-2">
                      {editKey === s.key ? (
                        <>
                          <button 
                            onClick={() => updateSetting.mutate({ key: s.key, value: editVal })} 
                            disabled={updateSetting.isPending} 
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
                          >
                            {updateSetting.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            Guardar
                          </button>
                          <button 
                            onClick={() => setEditKey(null)} 
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition-all"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => { setEditKey(s.key); setEditVal(s.value); }} 
                          className="px-3 py-1.5 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-50 active:scale-97 transition-all flex items-center gap-1"
                        >
                          Editar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {settings.filter(s => s && s.key && !s.key.toUpperCase().startsWith("MENU_SHOW_")).length === 0 && (
                <div className="p-8 text-center text-gray-400 text-xs font-bold">No hay variables de configuración registradas</div>
              )}
            </div>
          )}
        </div>

        {/* Agregar nueva configuración */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Crear Variable Personalizada</h3>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Agrega variables personalizadas a la base de datos para consumirlas en componentes del sistema</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              value={newKey} 
              onChange={e => setNewKey(e.target.value)} 
              placeholder="clave_config (ej. site_meta)" 
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-brand-magenta font-semibold transition-all" 
            />
            <input 
              value={newVal} 
              onChange={e => setNewVal(e.target.value)} 
              placeholder="valor de la variable" 
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-brand-magenta font-semibold transition-all" 
            />
            <button 
              onClick={() => { 
                if (newKey && newVal) { 
                  updateSetting.mutate({ key: newKey, value: newVal }, { 
                    onSuccess: () => { setNewKey(""); setNewVal(""); } 
                  }); 
                } 
              }} 
              disabled={updateSetting.isPending}
              className="px-5 py-2.5 bg-gradient-to-r from-brand-magenta to-purple-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:opacity-90 active:scale-97 transition-all shrink-0 border border-pink-700 shadow-sm"
            >
              {updateSetting.isPending ? "Guardando..." : "Crear Variable"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
