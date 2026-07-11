import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../lib/auth";
import { logActivity } from "../../lib/activityLogger";
import { useLocation } from "wouter";
import { supabase } from "../../lib/supabase";
import { AdminTabBar } from "../../components/admin/AdminTabBar";
import { TENANTS_REGISTRY, type TenantConfig } from "../../tenants/tenantContext";
import { 
  Network, Settings, Server, Plus, Edit3, Save, Trash2, 
  Search, ShieldAlert, CheckCircle, HelpCircle, Activity, 
  Sliders, Grid, Smartphone, RefreshCw, X, Loader2
} from "lucide-react";

export function AdminSaaS() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Estados de datos
  const [tenants, setTenants] = useState<TenantConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Estados de Modal y Edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Partial<TenantConfig> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Seguridad: Redirección si no es administrador
  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      setLocation("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Cargar lista de Tenants (de base de datos o localStorage si no hay base de datos)
  const loadTenants = async () => {
    try {
      setLoading(true);
      
      // 1. Intentar consultar en base de datos
      const { data, error } = await supabase.from("tenant_configurations").select("*");
      
      let finalTenantsList: TenantConfig[] = [];
      
      // 2. Si no hay tabla o da error, usar localStorage como simulación SaaS
      const localKey = "hdv_tenants_configurations";
      const localData = localStorage.getItem(localKey);
      
      if (error || !data || data.length === 0) {
        if (localData) {
          finalTenantsList = JSON.parse(localData);
        } else {
          // Inicializar con el registro estático de config.json
          finalTenantsList = Object.values(TENANTS_REGISTRY);
          localStorage.setItem(localKey, JSON.stringify(finalTenantsList));
        }
      } else {
        // Mapear datos de la DB
        finalTenantsList = data.map((t: any) => ({
          establishment_id: t.establishment_id,
          slug: t.slug,
          name: t.name,
          template: t.template,
          domain: t.domain,
          branding: typeof t.branding === "string" ? JSON.parse(t.branding) : t.branding,
          modules: typeof t.modules === "string" ? JSON.parse(t.modules) : t.modules,
          contact: typeof t.contact === "string" ? JSON.parse(t.contact) : t.contact
        }));
        
        // Sincronizar en localStorage por respaldo
        localStorage.setItem(localKey, JSON.stringify(finalTenantsList));
      }
      
      setTenants(finalTenantsList);
    } catch (e) {
      console.error("Error al cargar configuración SaaS:", e);
      // Fallback robusto final
      setTenants(Object.values(TENANTS_REGISTRY));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  // Filtrar lista de tenants según búsqueda
  const filteredTenants = useMemo(() => {
    return tenants.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.domain.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tenants, searchQuery]);

  // Estadísticas del Dashboard SaaS
  const stats = useMemo(() => {
    const total = tenants.length;
    const templateA = tenants.filter(t => t.template === "A").length;
    const templateB = tenants.filter(t => t.template === "B").length;
    const activePOS = tenants.filter(t => t.modules.pos).length;
    
    return { total, templateA, templateB, activePOS };
  }, [tenants]);

  // Iniciar la edición de un Tenant
  const handleEditClick = (tenant: TenantConfig) => {
    setEditingTenant(JSON.parse(JSON.stringify(tenant))); // Copia profunda
    setShowEditModal(true);
    setFeedbackMsg(null);
  };

  // Crear un nuevo Tenant de prueba/nuevo nodo
  const handleCreateClick = () => {
    const nextId = tenants.length > 0 ? Math.max(...tenants.map(t => t.establishment_id)) + 1 : 101;
    setEditingTenant({
      establishment_id: nextId,
      slug: "nuevo-hotel",
      name: "Nuevo Hotel",
      template: "A",
      domain: "nuevohotel.com",
      branding: {
        primary_color: "#00C8D4",
        secondary_color: "#9B00CC",
        accent_color: "#FF0096",
        font_title: "Playfair Display",
        font_body: "Montserrat",
        logo_url: "https://r2.hotelesdevenezuela.com/nuevo-hotel/logo.png",
        banner_url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600&auto=format&fit=crop"
      },
      modules: {
        reservas: true,
        pos: false,
        galeria: true,
        contacto: true,
        tareas: false,
        finanzas: false,
        cms: false,
        analiticas: false
      },
      contact: {
        phone: "+58 412 000 0000",
        whatsapp: "+58 412 000 0000",
        email: "contacto@nuevohotel.com",
        instagram: "@nuevohotel"
      }
    });
    setShowEditModal(true);
    setFeedbackMsg(null);
  };

  // Guardar configuración del Tenant
  const handleSaveTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant || !editingTenant.slug || !editingTenant.name) return;

    setIsSaving(true);
    setFeedbackMsg(null);

    try {
      const isNew = !tenants.some(t => t.establishment_id === editingTenant.establishment_id);
      
      // 1. Guardar en Supabase (de forma segura con upsert)
      const { error: dbError } = await supabase.from("tenant_configurations").upsert({
        establishment_id: editingTenant.establishment_id,
        slug: editingTenant.slug,
        name: editingTenant.name,
        template: editingTenant.template,
        domain: editingTenant.domain,
        branding: JSON.stringify(editingTenant.branding),
        modules: JSON.stringify(editingTenant.modules),
        contact: JSON.stringify(editingTenant.contact),
        updated_at: new Date().toISOString()
      }, { onConflict: "establishment_id" });

      if (dbError) {
        console.warn("La tabla tenant_configurations falló en la base de datos, guardando en local simulado:", dbError);
      }

      // 2. Sincronizar en localStorage para compatibilidad inmediata en local
      const localKey = "hdv_tenants_configurations";
      let currentList = [...tenants];
      
      if (isNew) {
        currentList.push(editingTenant as TenantConfig);
      } else {
        currentList = currentList.map(t => 
          t.establishment_id === editingTenant.establishment_id ? (editingTenant as TenantConfig) : t
        );
      }

      localStorage.setItem(localKey, JSON.stringify(currentList));
      setTenants(currentList);

      logActivity(
         user?.id || null,
         user?.email || "hotelesdevenezuela77@gmail.com",
         isNew ? "CREATE_TENANT" : "EDIT_TENANT",
         `${isNew ? "Creación" : "Edición"} de la configuración SaaS para el establecimiento ${editingTenant.name} (${editingTenant.slug}).`
       );

      setFeedbackMsg({ type: "success", text: "Configuración guardada e inyectada con éxito." });
      
      // Recargar cambios
      setTimeout(() => {
        setShowEditModal(false);
        setEditingTenant(null);
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setFeedbackMsg({ type: "error", text: err?.message || "Ocurrió un error inesperado al guardar." });
    } finally {
      setIsSaving(false);
    }
  };

  // Eliminar un Tenant
  const handleDeleteTenant = async (id: number) => {
    if (!confirm("¿Está seguro de que desea eliminar este Tenant del panel visual SaaS?")) return;
    
    try {
      // 1. Eliminar de Supabase
      const { error } = await supabase.from("tenant_configurations").delete().eq("establishment_id", id);
      if (error) {
        console.warn("Error al borrar en DB Supabase, aplicando borrado local:", error);
      }

      // 2. Borrar en local
      const localKey = "hdv_tenants_configurations";
      const deletedTenant = tenants.find(t => t.establishment_id === id);
      const updated = tenants.filter(t => t.establishment_id !== id);
      localStorage.setItem(localKey, JSON.stringify(updated));
      setTenants(updated);
       
      logActivity(
        user?.id || null,
        user?.email || "hotelesdevenezuela77@gmail.com",
        "DELETE_TENANT",
        `Eliminación del establecimiento SaaS: ${deletedTenant?.name || "Desconocido"} (ID: ${id}).`
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen pb-20 text-slate-100 font-sans" style={{ backgroundColor: "#0b0c10" }}>
      
      {/* Cabecera Principal del Panel */}
      <header className="relative w-full border-b border-white/5 py-10 bg-[#121620]/45 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#00C8D4] to-[#9B00CC] flex items-center justify-center shadow-lg shadow-[#00C8D4]/10">
              <Network className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white font-serif tracking-wide">CONSOLA DE GESTIÓN SAAS</h1>
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mt-0.5">
                Control de Nodos Inquilinos y Módulos en Tiempo Real
              </p>
            </div>
          </div>
          <button
            onClick={handleCreateClick}
            className="flex items-center gap-2 bg-[#FF0096] hover:bg-[#d40085] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-97 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Agregar Hotel / Posada
          </button>
        </div>
      </header>

      {/* Tab bar del Panel de Administrador */}
      <AdminTabBar />

      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8 animate-fade-in">
        
        {/* Fila de Estadísticas SaaS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#121620] border border-white/5 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-[#00C8D4]/10 rounded-xl">
              <Server className="w-5 h-5 text-[#00C8D4]" />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Hoteles SaaS</span>
              <p className="text-xl font-black text-white mt-0.5">{stats.total}</p>
            </div>
          </div>

          <div className="bg-[#121620] border border-white/5 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-[#9B00CC]/10 rounded-xl">
              <Activity className="w-5 h-5 text-[#9B00CC]" />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Template A</span>
              <p className="text-xl font-black text-white mt-0.5">{stats.templateA} Hospedajes</p>
            </div>
          </div>

          <div className="bg-[#121620] border border-white/5 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-[#FF0096]/10 rounded-xl">
              <Sliders className="w-5 h-5 text-[#FF0096]" />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Template B</span>
              <p className="text-xl font-black text-white mt-0.5">{stats.templateB} Complejos</p>
            </div>
          </div>

          <div className="bg-[#121620] border border-white/5 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <Grid className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Club POS Activos</span>
              <p className="text-xl font-black text-white mt-0.5">{stats.activePOS} Nodos</p>
            </div>
          </div>
        </div>

        {/* Sección de Tabla */}
        <div className="bg-[#121620] border border-white/5 rounded-3xl p-6 shadow-2xl">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="text-sm font-bold font-serif uppercase tracking-widest text-[#00C8D4] flex items-center gap-2">
              <Activity className="w-4 h-4" /> Nodos de Inquilinos Activos
            </h3>
            
            {/* Buscador */}
            <div className="flex items-center gap-2 bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 w-full md:max-w-xs focus-within:border-[#00C8D4] transition-colors">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar por nombre o dominio..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-white placeholder-gray-600 w-full"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-10 h-10 text-[#00C8D4] animate-spin mb-4" />
              <span className="text-xs">Sincronizando configuraciones en la nube...</span>
            </div>
          ) : filteredTenants.length === 0 ? (
            <div className="py-20 text-center text-slate-600 border border-dashed border-white/10 rounded-2xl">
              <ShieldAlert className="w-12 h-12 text-[#FF0096] mx-auto mb-3" />
              <p className="text-xs font-bold">No se encontraron establecimientos registrados en la red.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/30 text-gray-500 font-bold uppercase tracking-wider border-b border-white/5">
                    <th className="py-4 px-4 text-center">ID</th>
                    <th className="py-4 px-4">Establecimiento</th>
                    <th className="py-4 px-4">Slug</th>
                    <th className="py-4 px-4">Dominio Asignado</th>
                    <th className="py-4 px-4 text-center">Blueprint</th>
                    <th className="py-4 px-4 text-center">Módulos</th>
                    <th className="py-4 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTenants.map((t) => (
                    <tr key={t.establishment_id} className="hover:bg-white/2 transition-colors">
                      <td className="py-4 px-4 text-center font-mono font-bold text-[#00C8D4]">{t.establishment_id}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {/* Muestra de color primario */}
                          <div 
                            className="w-4 h-4 rounded-full border border-white/20 shrink-0" 
                            style={{ backgroundColor: t.branding.primary_color }}
                          ></div>
                          <span className="font-bold text-white">{t.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-400">{t.slug}</td>
                      <td className="py-4 px-4">
                        <a 
                          href={`http://${t.domain}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="hover:underline text-[#00C8D4] flex items-center gap-1"
                        >
                          {t.domain}
                        </a>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full font-black text-[10px] ${
                          t.template === "B" ? "bg-[#FF0096]/10 text-[#FF0096]" : "bg-[#9B00CC]/10 text-[#9B00CC]"
                        }`}>
                          Template {t.template}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          {t.modules.reservas && <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[9px]">Reservas</span>}
                          {t.modules.pos && <span className="bg-[#FF0096]/20 text-[#FF0096] px-2 py-0.5 rounded text-[9px] font-bold">Club POS</span>}
                          {t.modules.vip_zones && <span className="bg-[#00C8D4]/20 text-[#00C8D4] px-2 py-0.5 rounded text-[9px] font-bold">Zonas VIP</span>}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(t)}
                            className="p-2 bg-white/5 hover:bg-[#00C8D4]/20 text-slate-300 hover:text-[#00C8D4] rounded-lg border border-white/5 hover:border-[#00C8D4]/40 transition-all cursor-pointer"
                            title="Editar Configuración"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTenant(t.establishment_id)}
                            className="p-2 bg-white/5 hover:bg-red-500/20 text-slate-300 hover:text-red-500 rounded-lg border border-white/5 hover:border-red-500/40 transition-all cursor-pointer"
                            title="Eliminar Tenant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ── MODAL DE EDICIÓN / CREACIÓN SAAS (EDITOR VISUAL DE TENANT) ── */}
      {showEditModal && editingTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#121620] border border-white/10 rounded-3xl max-w-2xl w-full p-6 md:p-8 relative shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Cabecera del Modal */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#00C8D4]" />
                <h4 className="text-base font-bold font-serif text-white">
                  {tenants.some(t => t.establishment_id === editingTenant.establishment_id)
                    ? `Configuración de ${editingTenant.name}`
                    : "Registrar Nuevo Nodo Tenant"}
                </h4>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedbackMsg && (
              <div className={`border rounded-xl px-4 py-3 text-xs flex items-center gap-2 ${
                feedbackMsg.type === "success" 
                  ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-400" 
                  : "bg-red-500/10 border-red-500/35 text-red-400"
              }`}>
                {feedbackMsg.type === "success" ? <CheckCircle className="w-5 h-5 shrink-0" /> : <ShieldAlert className="w-5 h-5 shrink-0" />}
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveTenant} className="space-y-6">
              
              {/* Bloque: Parámetros del Core */}
              <div className="space-y-4">
                <h5 className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-white/5 pb-1">
                  <Server className="w-3.5 h-3.5 text-[#00C8D4]" /> Parámetros del Core SaaS
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Establishment ID (Core DB)</label>
                    <input
                      type="number"
                      required
                      value={editingTenant.establishment_id || ""}
                      onChange={e => setEditingTenant(prev => ({ ...prev, establishment_id: Number(e.target.value) }))}
                      disabled={tenants.some(t => t.establishment_id === editingTenant.establishment_id)}
                      className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00C8D4] disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Slug (URL identificador)</label>
                    <input
                      type="text"
                      required
                      value={editingTenant.slug || ""}
                      onChange={e => setEditingTenant(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00C8D4]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Nombre Comercial</label>
                    <input
                      type="text"
                      required
                      value={editingTenant.name || ""}
                      onChange={e => setEditingTenant(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00C8D4]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Dominio Personalizado</label>
                    <input
                      type="text"
                      required
                      value={editingTenant.domain || ""}
                      onChange={e => setEditingTenant(prev => ({ ...prev, domain: e.target.value }))}
                      className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00C8D4]"
                    />
                  </div>
                </div>
              </div>

              {/* Bloque: Configuración de Plantilla y Módulos */}
              <div className="space-y-4">
                <h5 className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-white/5 pb-1">
                  <Sliders className="w-3.5 h-3.5 text-[#FF0096]" /> Plantilla y Módulos Activos
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Blueprint Seleccionado</label>
                    <select
                      value={editingTenant.template || "A"}
                      onChange={e => setEditingTenant(prev => ({ ...prev, template: e.target.value as "A" | "B" }))}
                      className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00C8D4]"
                    >
                      <option value="A" className="bg-[#121620]">Template A (Hospedaje Estándar)</option>
                      <option value="B" className="bg-[#121620]">Template B (Premium/Complejos con POS)</option>
                    </select>
                  </div>
                  
                  {/* Módulos checkboxes */}
                  <div className="flex flex-col gap-2.5 justify-center">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingTenant.modules?.reservas || false}
                        onChange={e => setEditingTenant(prev => ({
                          ...prev,
                          modules: { ...prev.modules!, reservas: e.target.checked }
                        }))}
                        className="rounded accent-[#00C8D4] w-4 h-4 bg-slate-950/40 border border-white/10"
                      />
                      <span>Módulo Reservas Directas</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingTenant.modules?.pos || false}
                        onChange={e => setEditingTenant(prev => ({
                          ...prev,
                          modules: { ...prev.modules!, pos: e.target.checked }
                        }))}
                        className="rounded accent-[#FF0096] w-4 h-4 bg-slate-950/40 border border-white/10"
                      />
                      <span className="text-[#FF0096] font-bold">Módulo Club POS</span>
                    </label>
                    {editingTenant.template === "B" && (
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingTenant.modules?.vip_zones || false}
                          onChange={e => setEditingTenant(prev => ({
                            ...prev,
                            modules: { ...prev.modules!, vip_zones: e.target.checked }
                          }))}
                          className="rounded accent-[#00C8D4] w-4 h-4 bg-slate-950/40 border border-white/10"
                        />
                        <span className="text-[#00C8D4]">Zonas y Experiencias VIP</span>
                      </label>
                    )}
                    
                    {/* Nuevos Módulos Adicionales (PMS & CMS) */}
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingTenant.modules?.tareas || false}
                        onChange={e => setEditingTenant(prev => ({
                          ...prev,
                          modules: { ...prev.modules!, tareas: e.target.checked }
                        }))}
                        className="rounded accent-[#9B00CC] w-4 h-4 bg-slate-950/40 border border-white/10"
                      />
                      <span>Módulo Gestión de Tareas</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingTenant.modules?.finanzas || false}
                        onChange={e => setEditingTenant(prev => ({
                          ...prev,
                          modules: { ...prev.modules!, finanzas: e.target.checked }
                        }))}
                        className="rounded accent-[#00C8D4] w-4 h-4 bg-slate-950/40 border border-white/10"
                      />
                      <span>Módulo Finanzas y Gastos</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingTenant.modules?.cms || false}
                        onChange={e => setEditingTenant(prev => ({
                          ...prev,
                          modules: { ...prev.modules!, cms: e.target.checked }
                        }))}
                        className="rounded accent-[#FF0096] w-4 h-4 bg-slate-950/40 border border-white/10"
                      />
                      <span>Administrador de Contenidos (CMS)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingTenant.modules?.analiticas || false}
                        onChange={e => setEditingTenant(prev => ({
                          ...prev,
                          modules: { ...prev.modules!, analiticas: e.target.checked }
                        }))}
                        className="rounded accent-indigo-500 w-4 h-4 bg-slate-950/40 border border-white/10"
                      />
                      <span>Módulo Estadísticas Generales</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Bloque: Identidad de Marca y Colores (AGENTS.md) */}
              <div className="space-y-4">
                <h5 className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-white/5 pb-1">
                  <Grid className="w-3.5 h-3.5 text-[#9B00CC]" /> Identidad de Marca (Branding)
                </h5>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Color Primario</label>
                    <input
                      type="color"
                      value={editingTenant.branding?.primary_color || "#00C8D4"}
                      onChange={e => setEditingTenant(prev => ({
                        ...prev,
                        branding: { ...prev.branding!, primary_color: e.target.value }
                      }))}
                      className="w-full h-10 bg-slate-950/40 border border-white/10 rounded-xl px-1.5 py-1.5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Color Secundario</label>
                    <input
                      type="color"
                      value={editingTenant.branding?.secondary_color || "#9B00CC"}
                      onChange={e => setEditingTenant(prev => ({
                        ...prev,
                        branding: { ...prev.branding!, secondary_color: e.target.value }
                      }))}
                      className="w-full h-10 bg-slate-950/40 border border-white/10 rounded-xl px-1.5 py-1.5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Acento (Branding)</label>
                    <input
                      type="color"
                      value={editingTenant.branding?.accent_color || "#FF0096"}
                      onChange={e => setEditingTenant(prev => ({
                        ...prev,
                        branding: { ...prev.branding!, accent_color: e.target.value }
                      }))}
                      className="w-full h-10 bg-slate-950/40 border border-white/10 rounded-xl px-1.5 py-1.5 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Tipografía Título (Serif)</label>
                    <select
                      value={editingTenant.branding?.font_title || "Playfair Display"}
                      onChange={e => setEditingTenant(prev => ({
                        ...prev,
                        branding: { ...prev.branding!, font_title: e.target.value }
                      }))}
                      className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    >
                      <option value="Playfair Display" className="bg-[#121620]">Playfair Display</option>
                      <option value="Cinzel" className="bg-[#121620]">Cinzel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Tipografía Cuerpo (Sans-Serif)</label>
                    <select
                      value={editingTenant.branding?.font_body || "Montserrat"}
                      onChange={e => setEditingTenant(prev => ({
                        ...prev,
                        branding: { ...prev.branding!, font_body: e.target.value }
                      }))}
                      className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    >
                      <option value="Montserrat" className="bg-[#121620]">Montserrat</option>
                      <option value="Outfit" className="bg-[#121620]">Outfit</option>
                      <option value="Inter" className="bg-[#121620]">Inter</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Imagen de Banner (URL R2 / Unsplash)</label>
                  <input
                    type="url"
                    value={editingTenant.branding?.banner_url || ""}
                    onChange={e => setEditingTenant(prev => ({
                      ...prev,
                      branding: { ...prev.branding!, banner_url: e.target.value }
                    }))}
                    className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00C8D4]"
                    placeholder="https://r2.hotelesdevenezuela.com/..."
                  />
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 hover:border-white/30 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-[#00C8D4] hover:bg-[#00b0bd] text-[#0b0c10] px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 disabled:opacity-50 active:scale-97 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sincronizando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Guardar Cambios</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
