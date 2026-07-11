import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { 
  FileText, Image, Save, Upload, Loader2, 
  CheckCircle, ShieldAlert, Sparkles, RefreshCw, Eye
} from "lucide-react";
import type { TenantConfig } from "../../tenantContext";

interface CMSModuleProps {
  config: TenantConfig;
  onConfigChange: (updatedConfig: TenantConfig) => void;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export function CMSModule({ config, onConfigChange, primaryColor, secondaryColor, accentColor }: CMSModuleProps) {
  // Estados para inputs del CMS
  const [name, setName] = useState(config.name);
  const [domain, setDomain] = useState(config.domain);
  const [bannerUrl, setBannerUrl] = useState(config.branding.banner_url);
  const [phone, setPhone] = useState(config.contact.phone);
  const [whatsapp, setWhatsapp] = useState(config.contact.whatsapp);
  const [email, setEmail] = useState(config.contact.email);
  const [instagram, setInstagram] = useState(config.contact.instagram);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Manejo de carga de imagen local (Simulador Base64 para R2)
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setBannerUrl(reader.result); // Inyectar como Base64
      }
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    // Clonar y actualizar el objeto TenantConfig
    const updatedConfig: TenantConfig = {
      ...config,
      name,
      domain,
      branding: {
        ...config.branding,
        banner_url: bannerUrl
      },
      contact: {
        ...config.contact,
        phone,
        whatsapp,
        email,
        instagram
      }
    };

    try {
      // 1. Guardar en base de datos Supabase
      const { error } = await supabase
        .from("tenant_configurations")
        .update({
          name: updatedConfig.name,
          domain: updatedConfig.domain,
          branding: JSON.stringify(updatedConfig.branding),
          contact: JSON.stringify(updatedConfig.contact),
          updated_at: new Date().toISOString()
        })
        .eq("establishment_id", config.establishment_id);

      if (error) {
        console.warn("[PMS CMS] Error al guardar en base de datos remota, aplicando almacenamiento local simulado:", error);
      }

      // 2. Guardar en localStorage para persistencia local de simulación
      const localKey = "hdv_tenants_configurations";
      const localData = localStorage.getItem(localKey);
      let currentList: TenantConfig[] = [];

      if (localData) {
        currentList = JSON.parse(localData);
      } else {
        currentList = [config];
      }

      const index = currentList.findIndex(t => t.establishment_id === config.establishment_id);
      if (index !== -1) {
        currentList[index] = updatedConfig;
      } else {
        currentList.push(updatedConfig);
      }

      localStorage.setItem(localKey, JSON.stringify(currentList));

      // 3. Notificar cambios al contexto del inquilino
      onConfigChange(updatedConfig);

      setFeedback({ type: "success", text: "¡Contenido actualizado en vivo con éxito!" });
    } catch (err: any) {
      console.error(err);
      setFeedback({ type: "error", text: err?.message || "Error al actualizar contenidos." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#121620] border border-white/5 rounded-3xl p-6 shadow-xl space-y-6">
      
      {/* Header del Módulo */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/15 flex items-center justify-center">
            <FileText className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h3 className="text-base font-bold font-serif text-white tracking-wide">CMS - Administrador de Contenidos</h3>
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mt-0.5">Controla las imágenes y textos de tu web</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <a 
            href={`/?tenant=${config.slug}`} 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/20 text-slate-300 text-xs font-semibold"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ver Web</span>
          </a>
        </div>
      </div>

      {feedback && (
        <div className={`border rounded-xl px-4 py-3 text-xs flex items-center gap-2 ${
          feedback.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-400" 
            : "bg-red-500/10 border-red-500/35 text-red-400"
        }`}>
          {feedback.type === "success" ? <CheckCircle className="w-5 h-5 shrink-0" /> : <ShieldAlert className="w-5 h-5 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      <form onSubmit={handleSaveCMS} className="space-y-6">
        
        {/* Sección: Textos y Datos */}
        <div className="space-y-4">
          <h4 className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-white/5 pb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#00C8D4]" /> Textos de Presentación
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Nombre Comercial de la Posada</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00C8D4]"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Dominio Asignado</label>
              <input
                type="text"
                required
                value={domain}
                onChange={e => setDomain(e.target.value)}
                className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00C8D4]"
              />
            </div>
          </div>
        </div>

        {/* Sección: Carga de Imagen de Banner */}
        <div className="space-y-4">
          <h4 className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-white/5 pb-1">
            <Image className="w-3.5 h-3.5 text-[#FF0096]" /> Imagen de Banner Principal (Full-Bleed)
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Vista previa de imagen */}
            <div className="relative rounded-2xl overflow-hidden aspect-video border border-white/10 bg-slate-950/40 flex items-center justify-center">
              {bannerUrl ? (
                <img src={bannerUrl} alt="Vista previa del banner" className="object-cover w-full h-full" />
              ) : (
                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Sin imagen configurada</span>
              )}
            </div>

            {/* Subir archivo */}
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Opción A: Subir imagen de tus archivos</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-white/15 hover:border-white/30 rounded-2xl cursor-pointer hover:bg-white/2 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-4 pb-4">
                      {isUploading ? (
                        <RefreshCw className="w-5 h-5 text-gray-500 animate-spin mb-1" />
                      ) : (
                        <Upload className="w-5 h-5 text-gray-500 mb-1" />
                      )}
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cargar Archivo</p>
                      <p className="text-[9px] text-gray-600">PNG, JPG de alta resolución</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                      disabled={isUploading} 
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Opción B: URL Directa de la Imagen</label>
                <input
                  type="url"
                  value={bannerUrl.startsWith("data:") ? "" : bannerUrl}
                  onChange={e => setBannerUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00C8D4]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sección: Contacto */}
        <div className="space-y-4">
          <h4 className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-white/5 pb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#9B00CC]" /> Información de Contacto del Hotel
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[9px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Teléfono</label>
              <input
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">WhatsApp</label>
              <input
                type="text"
                required
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Email Público</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Instagram</label>
              <input
                type="text"
                required
                value={instagram}
                onChange={e => setInstagram(e.target.value)}
                className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Botón de Guardado */}
        <div className="flex justify-end pt-4 border-t border-white/5">
          <button
            type="submit"
            disabled={saving || isUploading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-[#0b0c10] transition-transform duration-200 active:scale-97 cursor-pointer"
            style={{ backgroundColor: accentColor }}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Cambios Web</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
