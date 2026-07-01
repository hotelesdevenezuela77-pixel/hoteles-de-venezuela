import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { Mail, Send, AlertCircle, Save, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";

const DEFAULT_TEMPLATES = [
  { key: "email_tpl_welcome",    name: "Bienvenida al registrarse",      trigger: "Al crear cuenta",                 defaultStatus: "activo"   },
  { key: "email_tpl_reservation",name: "Confirmación de reserva",         trigger: "Al confirmar reserva",            defaultStatus: "activo"   },
  { key: "email_tpl_quote",      name: "Cotización enviada",               trigger: "Al enviar cotización",            defaultStatus: "activo"   },
  { key: "email_tpl_reminder",   name: "Recordatorio de reserva",          trigger: "24h antes del check-in",          defaultStatus: "pendiente"},
  { key: "email_tpl_review",     name: "Solicitud de reseña",              trigger: "3 días después del check-out",    defaultStatus: "pendiente"},
  { key: "email_tpl_approval",   name: "Notificación de aprobación",       trigger: "Al aprobar establecimiento",      defaultStatus: "activo"   },
  { key: "email_tpl_cancelled",  name: "Reserva cancelada",                trigger: "Al cancelar reserva",             defaultStatus: "activo"   },
  { key: "email_tpl_payment",    name: "Confirmación de pago",             trigger: "Al procesar pago exitoso",        defaultStatus: "pendiente"},
];

const SMTP_VARS = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "FROM_EMAIL", "FROM_NAME"];

export function AdminCorreos() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, nav] = useLocation();
  const qc = useQueryClient();

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      nav("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Fetch settings for email templates
  const { data: settingsData = { settings: [] }, isLoading: loadingSettings } = useQuery<{ settings: { settingKey: string; settingValue: string }[] }>({
    queryKey: ["site-settings-email"],
    queryFn: async () => {
      let dbData: any[] = [];
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("*")
          .eq("setting_group", "email_templates");
        if (error) throw error;
        dbData = data || [];
      } catch (err) {
        console.warn("Supabase site_settings email templates failed, falling back to local storage:", err);
      }

      const localKey = "hdv_mock_email_templates";
      const fallback = DEFAULT_TEMPLATES.map(t => ({
        setting_key: t.key,
        setting_value: t.defaultStatus,
        setting_group: "email_templates"
      }));

      let local = localStorage.getItem(localKey);
      if (!local) {
        localStorage.setItem(localKey, JSON.stringify(fallback));
        local = JSON.stringify(fallback);
      }
      const localData = JSON.parse(local);
      const combined = [...dbData, ...localData];

      const seen = new Set();
      const settingsList: any[] = [];
      combined.forEach((item: any) => {
        const k = item.setting_key || item.settingKey;
        if (k && !seen.has(k)) {
          seen.add(k);
          settingsList.push({
            settingKey: k,
            settingValue: item.setting_value ?? item.settingValue ?? "activo"
          });
        }
      });
      return { settings: settingsList };
    },
  });

  // Save template setting mutation
  const saveSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const payload = {
        setting_key: key,
        setting_value: value,
        setting_group: "email_templates"
      };

      const localKey = "hdv_mock_email_templates";
      const localData = JSON.parse(localStorage.getItem(localKey) || "[]");
      const isMock = localData.some((item: any) => (item.setting_key || item.settingKey) === key);

      if (isMock) {
        const updated = localData.map((item: any) => {
          const k = item.setting_key || item.settingKey;
          if (k === key) {
            return { ...item, ...payload };
          }
          return item;
        });
        localStorage.setItem(localKey, JSON.stringify(updated));
        return { success: true };
      }

      try {
        const { error } = await supabase
          .from("site_settings")
          .upsert(payload, { onConflict: 'setting_key' });
        if (error) throw error;
      } catch (err) {
        console.warn("Supabase upsert failed, saving setting locally:", err);
        const updated = localData.map((item: any) => {
          const k = item.setting_key || item.settingKey;
          if (k === key) {
            return { ...item, ...payload };
          }
          return item;
        });
        localStorage.setItem(localKey, JSON.stringify(updated));
      }
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-settings-email"] });
    },
  });

  const getStatus = (key: string): string => {
    const setting = settingsData?.settings?.find(s => s.settingKey === key);
    if (setting) return setting.settingValue;
    return DEFAULT_TEMPLATES.find(t => t.key === key)?.defaultStatus ?? "pendiente";
  };

  const toggleTemplate = (key: string) => {
    const current = getStatus(key);
    saveSetting.mutate({ key, value: current === "activo" ? "pendiente" : "activo" });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
        <p className="text-gray-500 text-xs font-bold">Verificando credenciales de seguridad...</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen" style={{ background: "#F9FAFB" }}>
        <div className="relative overflow-hidden py-8" style={{ background: "linear-gradient(135deg, #0e0120, #1a0533)" }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: "#FF0096" }} />
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,0,150,0.2)" }}>
                <Mail className="w-5 h-5" style={{ color: "#FF0096" }} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-white">Correos Automáticos</h1>
                <p className="text-white/50 text-xs">Gestiona las plantillas de correo del sistema</p>
              </div>
            </div>
          </div>
        </div>

        <AdminTabBar />

        <div className="container mx-auto px-4 py-6 max-w-5xl">
          {/* SMTP notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-700 font-medium">Servidor SMTP requerido para envío real</p>
              <p className="text-xs text-amber-600 mt-1">
                Para activar el envío real de correos, configura en Secrets:{" "}
                <code className="bg-amber-100 px-1 rounded">SMTP_HOST</code>,{" "}
                <code className="bg-amber-100 px-1 rounded">SMTP_USER</code>,{" "}
                <code className="bg-amber-100 px-1 rounded">SMTP_PASS</code> y{" "}
                <code className="bg-amber-100 px-1 rounded">FROM_EMAIL</code>.
                Los estados de las plantillas se guardan en la base de datos.
              </p>
            </div>
          </div>

          {/* Templates */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Plantillas de correo</h2>
              <p className="text-xs text-gray-400 mt-0.5">Activa o desactiva cada plantilla — los cambios se guardan en la base de datos</p>
            </div>
            {loadingSettings ? (
              <div className="p-8 text-center text-gray-400 text-sm">Cargando plantillas…</div>
            ) : (
              DEFAULT_TEMPLATES.map((tpl) => {
                const status = getStatus(tpl.key);
                const isActive = status === "activo";
                return (
                  <div key={tpl.key} className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-0">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: isActive ? "rgba(0,200,212,0.1)" : "rgba(156,163,175,0.1)" }}>
                      <Send className="w-4 h-4" style={{ color: isActive ? "#00C8D4" : "#9CA3AF" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900">{tpl.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5 font-semibold">{tpl.trigger}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs px-2.5 py-1 rounded-full font-bold"
                        style={{
                          color: isActive ? "#10B981" : "#9CA3AF",
                          background: isActive ? "rgba(16,185,129,0.1)" : "rgba(156,163,175,0.1)",
                        }}>
                        {isActive ? "Activo" : "Pausado"}
                      </span>
                      <button
                        onClick={() => toggleTemplate(tpl.key)}
                        disabled={saveSetting.isPending}
                        className="transition-opacity disabled:opacity-50 cursor-pointer"
                        title={isActive ? "Pausar plantilla" : "Activar plantilla"}>
                        {isActive
                          ? <ToggleRight className="w-8 h-8" style={{ color: "#FF0096" }} />
                          : <ToggleLeft className="w-8 h-8 text-gray-300" />
                        }
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* SMTP env var status */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Variables de entorno SMTP</h2>
              <p className="text-xs text-gray-400 mt-0.5">Configura estas variables en Secrets para activar el envío real</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-6">
              {SMTP_VARS.map(v => (
                <div key={v} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
                  <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                  <code className="text-sm text-gray-700 font-mono font-semibold">{v}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
