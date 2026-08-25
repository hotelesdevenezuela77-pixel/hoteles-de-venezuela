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
  const [name, setName] = useState(config?.name || "");
  const [domain, setDomain] = useState(config?.domain || "");
  const [bannerUrl, setBannerUrl] = useState(config?.branding?.banner_url || "");
  const [logoUrl, setLogoUrl] = useState(config?.branding?.logo_url || "");
  const [phone, setPhone] = useState(config?.contact?.phone || "");
  const [whatsapp, setWhatsapp] = useState(config?.contact?.whatsapp || "");
  const [email, setEmail] = useState(config?.contact?.email || "");
  const [instagram, setInstagram] = useState(config?.contact?.instagram || "");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (config) {
      if (config.name) setName(config.name);
      if (config.domain) setDomain(config.domain);
      if (config.branding?.banner_url) setBannerUrl(config.branding.banner_url);
      if (config.branding?.logo_url) setLogoUrl(config.branding.logo_url);
      if (config.contact?.phone) setPhone(config.contact.phone);
      if (config.contact?.whatsapp) setWhatsapp(config.contact.whatsapp);
      if (config.contact?.email) setEmail(config.contact.email);
      if (config.contact?.instagram) setInstagram(config.contact.instagram);
    }
  }, [config]);

  // Cargar fotos por área del establecimiento (Piscina, Restaurante, Lobby, Fachada, Playa, Spa)
  const [areaPhotosState, setAreaPhotosState] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem("hdv_area_photos");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed[config.establishment_id] || {
          piscina: ["https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&auto=format&fit=crop"],
          restaurante: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop"],
          lobby: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop"],
          fachada: ["https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop"],
        };
      }
    } catch (e) {}
    return {
      piscina: ["https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&auto=format&fit=crop"],
      restaurante: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop"],
      lobby: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop"],
      fachada: ["https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop"],
    };
  });

  const [newAreaInput, setNewAreaInput] = useState<Record<string, string>>({
    piscina: "", restaurante: "", lobby: "", fachada: "", playa: "", spa: ""
  });

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Helper de compresión de imágenes con Canvas HTML5 (evita sobrepasar la cuota de localStorage y Payload de Supabase)
  const compressImage = (file: File, maxWidth: number, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.createElement("img");
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedDataUrl);
        };
        img.onerror = () => resolve(event.target?.result as string);
        img.src = event.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "banner" | "logo") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const maxWidth = type === "banner" ? 1600 : 600;
      const compressed = await compressImage(file, maxWidth, 0.82);
      if (type === "banner") setBannerUrl(compressed);
      else setLogoUrl(compressed);
    } catch (err) {
      console.error("Error al procesar la imagen cargada:", err);
      // Fallback directo a FileReader si la compresión falla
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          if (type === "banner") setBannerUrl(reader.result);
          else setLogoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddAreaPhoto = (areaKey: string) => {
    const url = (newAreaInput[areaKey] || "").trim();
    if (!url) return;
    setAreaPhotosState(prev => {
      const current = prev[areaKey] || [];
      const updatedList = [...current, url];
      try {
        const saved = localStorage.getItem("hdv_area_photos");
        let parsed: Record<string, Record<string, string[]>> = saved ? JSON.parse(saved) : {};
        parsed[config.establishment_id] = {
          ...(parsed[config.establishment_id] || {}),
          [areaKey]: updatedList
        };
        if (config.slug) {
          parsed[config.slug] = {
            ...(parsed[config.slug] || {}),
            [areaKey]: updatedList
          };
        }
        localStorage.setItem("hdv_area_photos", JSON.stringify(parsed));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("hdv_area_photos_updated"));
          window.dispatchEvent(new Event("storage"));
        }
      } catch (err) {}
      return { ...prev, [areaKey]: updatedList };
    });
    setNewAreaInput(prev => ({ ...prev, [areaKey]: "" }));
  };

  const handleRemoveAreaPhoto = (areaKey: string, index: number) => {
    setAreaPhotosState(prev => {
      const current = prev[areaKey] || [];
      const updatedList = current.filter((_, i) => i !== index);
      try {
        const saved = localStorage.getItem("hdv_area_photos");
        let parsed: Record<string, Record<string, string[]>> = saved ? JSON.parse(saved) : {};
        parsed[config.establishment_id] = {
          ...(parsed[config.establishment_id] || {}),
          [areaKey]: updatedList
        };
        if (config.slug) {
          parsed[config.slug] = {
            ...(parsed[config.slug] || {}),
            [areaKey]: updatedList
          };
        }
        localStorage.setItem("hdv_area_photos", JSON.stringify(parsed));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("hdv_area_photos_updated"));
          window.dispatchEvent(new Event("storage"));
        }
      } catch (err) {}
      return { ...prev, [areaKey]: updatedList };
    });
  };

  const handleAreaImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, areaKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const compressed = await compressImage(file, 1200, 0.82);
      setAreaPhotosState(prev => {
        const current = prev[areaKey] || [];
        const updatedList = [...current, compressed];
        try {
          const saved = localStorage.getItem("hdv_area_photos");
          let parsed: Record<string, Record<string, string[]>> = saved ? JSON.parse(saved) : {};
          parsed[config.establishment_id] = {
            ...(parsed[config.establishment_id] || {}),
            [areaKey]: updatedList
          };
          if (config.slug) {
            parsed[config.slug] = {
              ...(parsed[config.slug] || {}),
              [areaKey]: updatedList
            };
          }
          localStorage.setItem("hdv_area_photos", JSON.stringify(parsed));
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("hdv_area_photos_updated"));
            window.dispatchEvent(new Event("storage"));
          }
        } catch (err) {}
        return { ...prev, [areaKey]: updatedList };
      });

      try {
        const targetEstId = config.establishment_id;
        if (targetEstId) {
          await supabase.from("establishment_images").insert([
            {
              establishment_id: targetEstId,
              image_url: compressed,
              is_primary: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);
        }
      } catch (dbErr) {
        console.warn("[CMS Area Image Upload] Error guardando imagen en DB:", dbErr);
      }
    } catch (err) {
      console.error("Error procesando imagen del área:", err);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
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
        ...(config?.branding || {}),
        banner_url: bannerUrl,
        logo_url: logoUrl
      },
      contact: {
        ...(config?.contact || {}),
        phone,
        whatsapp,
        email,
        instagram
      }
    };

    try {
      // 1. Guardar y actualizar en la base de datos de Supabase (tabla "establishments" y "establishment_images")
      try {
        const { data: dbEst } = await supabase
          .from("establishments")
          .select("id")
          .or(`slug.eq.${config.slug},id.eq.${config.establishment_id || 0}`)
          .maybeSingle();

        const targetEstId = dbEst?.id || config.establishment_id;

        if (targetEstId) {
          await supabase
            .from("establishments")
            .update({
              name: updatedConfig.name,
              website: updatedConfig.domain ? `https://${updatedConfig.domain.replace(/^https?:\/\//, "").replace(/\/$/, "")}/` : undefined,
              phone: phone,
              whatsapp: whatsapp,
              email: email,
              instagram: instagram,
              updated_at: new Date().toISOString()
            })
            .eq("id", targetEstId);

          if (bannerUrl) {
            // Desmarcar principal previa e insertar la nueva imagen principal
            await supabase
              .from("establishment_images")
              .update({ is_primary: false })
              .eq("establishment_id", targetEstId);

            await supabase
              .from("establishment_images")
              .insert([
                {
                  establishment_id: targetEstId,
                  image_url: bannerUrl,
                  is_primary: true,
                  sort_order: 0,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              ]);
          }
        }
      } catch (estErr) {
        console.warn("[PMS CMS] No se pudo actualizar tabla de establecimientos e imágenes en DB:", estErr);
      }

      // 2. Guardar en localStorage para persistencia local de simulación
      const localKey = "hdv_tenants_configurations";
      const localData = localStorage.getItem(localKey);
      let currentList: TenantConfig[] = [];

      if (localData) {
        try {
          currentList = JSON.parse(localData);
        } catch (e) {
          currentList = [config];
        }
      } else {
        currentList = [config];
      }

      const index = currentList.findIndex(t => t.establishment_id === config.establishment_id || t.slug === config.slug);
      if (index !== -1) {
        currentList[index] = updatedConfig;
      } else {
        currentList.push(updatedConfig);
      }

      localStorage.setItem(localKey, JSON.stringify(currentList));

      // 2b. Sincronizar también con hdv_mock_establishments para la vista de detalle del portal (/establecimiento/:slug)
      try {
        const mockKey = "hdv_mock_establishments";
        const mockData = localStorage.getItem(mockKey);
        let mockList: any[] = mockData ? JSON.parse(mockData) : [];
        const mockIndex = mockList.findIndex(e => e.id === config.establishment_id || e.slug === config.slug);
        
        const updatedEstMock = {
          id: config.establishment_id,
          slug: config.slug,
          name: updatedConfig.name,
          website: updatedConfig.domain,
          primary_image: bannerUrl || logoUrl || config.branding.banner_url,
          phone,
          whatsapp,
          rating_avg: 4.8,
          review_count: 12,
          price_level: "$$",
          is_featured: true,
          services: "[]",
          membership_tier: "diamante",
          category_name: "Posadas",
          destination_name: "Tucacas"
        };

        if (mockIndex !== -1) {
          mockList[mockIndex] = { ...mockList[mockIndex], ...updatedEstMock };
        } else {
          mockList.push(updatedEstMock);
        }
        localStorage.setItem(mockKey, JSON.stringify(mockList));
      } catch (mockErr) {
        console.error("[PMS CMS] Error actualizando hdv_mock_establishments:", mockErr);
      }

      // 3. Notificar cambios al contexto del inquilino y despachar evento global en window
      onConfigChange(updatedConfig);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("hdv_tenant_config_updated", { detail: updatedConfig }));
      }

      setFeedback({ type: "success", text: "¡Contenido actualizado en vivo con éxito!" });
    } catch (err: any) {
      console.error(err);
      setFeedback({ type: "error", text: err?.message || "Error al actualizar contenidos." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-slate-800">
      
      {/* Header del Módulo */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF0096] to-[#9B00CC] flex items-center justify-center text-white shadow-md">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold font-serif text-slate-900 tracking-wide">CMS - Administrador de Contenidos Web</h3>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-0.5">Controla la imagen visual, fotos e información pública de tu hospedaje</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <a 
            href={`/establecimiento/${config.slug}`} 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Eye className="w-4 h-4 text-[#00C8D4]" />
            <span>Ver Web en Vivo</span>
          </a>
        </div>
      </div>

      {feedback && (
        <div className={`border rounded-2xl px-4 py-3 text-xs flex items-center gap-2 ${
          feedback.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {feedback.type === "success" ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> : <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />}
          <span className="font-semibold">{feedback.text}</span>
        </div>
      )}

      <form onSubmit={handleSaveCMS} className="space-y-6">
        
        {/* Sección: Textos y Datos */}
        <div className="space-y-4">
          <h4 className="text-[10px] uppercase font-extrabold tracking-wider text-[#FF0096] flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#00C8D4]" /> Textos de Presentación & Dominio
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">Nombre Comercial de la Posada</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#00C8D4] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">Dominio Asignado</label>
              <input
                type="text"
                required
                value={domain}
                onChange={e => setDomain(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#00C8D4] focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Sección: Logo Oficial del Establecimiento */}
        <div className="space-y-4">
          <h4 className="text-[10px] uppercase font-extrabold tracking-wider text-[#FF0096] flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#00C8D4]" /> Logo Oficial del Establecimiento (Reflejado en Menú Superior)
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Vista previa del Logo */}
            <div className="relative rounded-2xl overflow-hidden h-28 border border-slate-200 bg-slate-50 p-4 flex items-center justify-center shadow-inner">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo del establecimiento" className="max-h-full max-w-full object-contain" />
              ) : (
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Sin Logo Configurado</span>
                  <span className="text-[9px] text-slate-400">Se usará el distintivo con iniciales por defecto</span>
                </div>
              )}
            </div>

            {/* Subir archivo de Logo */}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Subir Logo desde tus archivos</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => handleImageUpload(e, "logo")} 
                  className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#00C8D4]/15 file:text-[#00C8D4] hover:file:bg-[#00C8D4]/25 cursor-pointer" 
                  disabled={isUploading} 
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">O escribe URL Directa del Logo</label>
                <input
                  type="url"
                  value={logoUrl.startsWith("data:") ? "" : logoUrl}
                  onChange={e => setLogoUrl(e.target.value)}
                  placeholder="https://midominio.com/logo.png"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#00C8D4] focus:bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sección: Carga de Imagen de Banner */}
        <div className="space-y-4">
          <h4 className="text-[10px] uppercase font-extrabold tracking-wider text-[#FF0096] flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
            <Image className="w-3.5 h-3.5 text-[#FF0096]" /> Imagen de Banner Principal (Full-Bleed)
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Vista previa de imagen */}
            <div className="relative rounded-2xl overflow-hidden aspect-video border border-slate-200 bg-slate-100 flex items-center justify-center shadow-xs">
              {bannerUrl ? (
                <img src={bannerUrl} alt="Vista previa del banner" className="object-cover w-full h-full" />
              ) : (
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sin imagen configurada</span>
              )}
            </div>

            {/* Subir archivo */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">Opción A: Subir imagen de tus archivos</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-slate-300 hover:border-[#00C8D4] rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-4 pb-4">
                      {isUploading ? (
                        <RefreshCw className="w-5 h-5 text-[#00C8D4] animate-spin mb-1" />
                      ) : (
                        <Upload className="w-5 h-5 text-[#00C8D4] mb-1" />
                      )}
                      <p className="text-[10px] text-slate-700 font-bold uppercase tracking-wider">Cargar Archivo de Banner</p>
                      <p className="text-[9px] text-slate-400">PNG, JPG de alta resolución</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => handleImageUpload(e, "banner")} 
                      className="hidden" 
                      disabled={isUploading} 
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">Opción B: URL Directa de la Imagen</label>
                <input
                  type="url"
                  value={bannerUrl.startsWith("data:") ? "" : bannerUrl}
                  onChange={e => setBannerUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#00C8D4] focus:bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sección: Fotos de las Diversas Áreas del Establecimiento */}
        <div className="space-y-4">
          <h4 className="text-[10px] uppercase font-extrabold tracking-wider text-[#FF0096] flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
            <Image className="w-3.5 h-3.5 text-[#9B00CC]" /> Fotos de las Diversas Áreas e Instalaciones
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "piscina", title: "🏊 Piscina & Solárium" },
              { key: "restaurante", title: "🍽️ Restaurante & Gastronomía" },
              { key: "lobby", title: "🏢 Lobby & Recepción" },
              { key: "fachada", title: "🌿 Fachada & Jardines" },
              { key: "playa", title: "🏖️ Playa / Exteriores" },
              { key: "spa", title: "🧘 Spa & Bienestar" }
            ].map(area => {
              const list = areaPhotosState[area.key] || [];
              return (
                <div key={area.key} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-900">{area.title}</span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{list.length} fotos</span>
                  </div>

                  {/* Grid de Fotos Existentes */}
                  <div className="grid grid-cols-3 gap-2">
                    {list.map((photoUrl, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden h-16 border border-slate-200 bg-slate-200">
                        <img src={photoUrl} alt={area.title} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveAreaPhoto(area.key, idx)}
                          className="absolute inset-0 bg-red-900/85 text-white font-extrabold text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Opciones para Añadir Foto (Subir Archivo o URL) */}
                  <div className="space-y-2 pt-1 border-t border-slate-200/60">
                    <label className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-[#00C8D4]/10 hover:bg-[#00C8D4]/20 border border-[#00C8D4]/30 rounded-xl text-xs font-black text-[#00C8D4] cursor-pointer transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir Foto desde Archivos</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleAreaImageUpload(e, area.key)}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>

                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="O pega URL: https://imagen.jpg"
                        value={newAreaInput[area.key] || ""}
                        onChange={e => setNewAreaInput(prev => ({ ...prev, [area.key]: e.target.value }))}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-[11px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00C8D4]"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddAreaPhoto(area.key)}
                        className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        + Añadir
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sección: Contacto */}
        <div className="space-y-4">
          <h4 className="text-[10px] uppercase font-extrabold tracking-wider text-[#FF0096] flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#9B00CC]" /> Información de Contacto del Hotel
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">Teléfono</label>
              <input
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#00C8D4] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">WhatsApp</label>
              <input
                type="text"
                required
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#00C8D4] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">Email Público</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#00C8D4] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">Instagram</label>
              <input
                type="text"
                required
                value={instagram}
                onChange={e => setInstagram(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#00C8D4] focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Botón de Guardado */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving || isUploading}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:from-[#FF0096]/90 hover:to-[#9B00CC]/90 transition-all shadow-lg shadow-pink-500/20 active:scale-97 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando Cambios Web...</span>
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
