import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { Settings, Check, Plus, Loader2 } from "lucide-react";

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

export function AdminConfig() {
  const { user, profile, loading: authLoading } = navAuth();
  const [, nav] = useLocation();
  const qc = useQueryClient();
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");

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
        {/* Site Settings */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6 shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50"><h2 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Ajustes Generales</h2></div>
          {loadingSettings ? <div className="p-6 text-center text-gray-400 text-xs font-bold">Cargando configuraciones...</div> : (
            <div className="divide-y divide-slate-100">
              {settings.map(s => (
                <div key={s.key} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{SETTING_LABELS[s.key] || s.key}</div>
                    {editKey === s.key ? (
                      <input value={editVal} onChange={e => setEditVal(e.target.value)} className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-pink-500 font-semibold" />
                    ) : (
                      <div className="text-sm font-bold text-gray-700 mt-1 truncate">{s.value || "—"}</div>
                    )}
                  </div>
                  {editKey === s.key ? (
                    <div className="flex gap-2">
                      <button onClick={() => updateSetting.mutate({ key: s.key, value: editVal })} disabled={updateSetting.isPending} className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setEditKey(null)} className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold cursor-pointer">Cancelar</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditKey(s.key); setEditVal(s.value); }} className="text-xs font-bold text-purple-600 hover:text-purple-750 cursor-pointer">Editar</button>
                  )}
                </div>
              ))}
              {settings.length === 0 && <div className="p-6 text-center text-gray-500 text-xs font-bold">No hay configuraciones registradas</div>}
            </div>
          )}
        </div>

        {/* Add new setting */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-xs">
          <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-3">Agregar nueva configuración</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="clave_config" className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500 font-semibold" />
            <input value={newVal} onChange={e => setNewVal(e.target.value)} placeholder="valor" className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500 font-semibold" />
            <button onClick={() => { if (newKey && newVal) { updateSetting.mutate({ key: newKey, value: newVal }, { onSuccess: () => { setNewKey(""); setNewVal(""); } }); } }} className="px-5 py-2.5 bg-gradient-to-r from-brand-magenta to-purple-600 text-white rounded-xl text-xs font-bold cursor-pointer border border-pink-700">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
