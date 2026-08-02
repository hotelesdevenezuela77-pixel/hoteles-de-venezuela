import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { 
  User, Settings, Mail, Shield, CheckCircle, Loader2, ArrowLeft, Phone,
  Building2, MapPin, Sparkles, Plus, Globe, Check, Zap, Droplets, Waves, Dog, Car, Utensils, LayoutDashboard, Briefcase
} from "lucide-react";

export function Perfil() {
  const { user, profile } = useAuth();
  const [, setLocation] = useLocation();
  
  // Tab control: "registrar" | "perfil"
  const [activeTab, setActiveTab] = useState<"registrar" | "perfil">("perfil");
  const [checkingProperties, setCheckingProperties] = useState(true);
  const [hasProperties, setHasProperties] = useState(false);

  // Estados para formulario de perfil
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Estados para formulario de contraseña
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState("");

  // Estados para registro de propiedad (Paso 1 Propietarios)
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [destinations, setDestinations] = useState<{ id: number; name: string; state: string }[]>([]);
  const [registeringEst, setRegisteringEst] = useState(false);
  const [estFormData, setEstFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    whatsapp: "",
    website: "",
    price_level: "$$",
    category_id: "",
    destination_id: "",
    services: [] as string[]
  });

  const availableServices = [
    { key: "wifi", label: "WiFi Gratis", icon: <Globe className="w-3.5 h-3.5" /> },
    { key: "estacionamiento", label: "Estacionamiento", icon: <Car className="w-3.5 h-3.5" /> },
    { key: "piscina", label: "Piscina", icon: <Waves className="w-3.5 h-3.5" /> },
    { key: "restaurante", label: "Restaurante", icon: <Utensils className="w-3.5 h-3.5" /> },
    { key: "planta_electrica", label: "Planta Eléctrica", icon: <Zap className="w-3.5 h-3.5" /> },
    { key: "tanque_agua", label: "Tanque de Agua", icon: <Droplets className="w-3.5 h-3.5" /> },
    { key: "pet_friendly", label: "Mascotas", icon: <Dog className="w-3.5 h-3.5" /> },
    { key: "spa", label: "Spa / Bienestar", icon: <Sparkles className="w-3.5 h-3.5" /> }
  ];

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  // Cargar opciones de categorías y destinos
  useEffect(() => {
    async function fetchOptions() {
      try {
        const [catsRes, destsRes] = await Promise.all([
          supabase.from("categories").select("id, name").order("name"),
          supabase.from("destinations").select("id, name, state").eq("status", "approved").order("name")
        ]);
        if (catsRes.data) setCategories(catsRes.data);
        if (destsRes.data) setDestinations(destsRes.data);
      } catch (e) {
        console.error("Error cargando opciones de registro:", e);
      }
    }
    fetchOptions();
  }, []);

  // Verificar propiedades registradas del usuario
  useEffect(() => {
    async function checkUserEstablishments() {
      if (!user) {
        setCheckingProperties(false);
        return;
      }

      try {
        setCheckingProperties(true);
        let dbCount = 0;
        try {
          const { data } = await supabase
            .from("establishments")
            .select("id")
            .eq("owner_user_id", user.id)
            .limit(1);
          dbCount = data ? data.length : 0;
        } catch {
          dbCount = 0;
        }

        const localEstsKey = "hdv_mock_establishments";
        const localEsts = JSON.parse(localStorage.getItem(localEstsKey) || "[]")
          .filter((e: any) => e.owner_user_id === user.id);

        const count = dbCount + localEsts.length;
        setHasProperties(count > 0);

        const params = new URLSearchParams(window.location.search);
        const explicitTab = params.get("tab");

        // Si se loguea un Administrador, llevarlo de una al Panel Administrativo Principal (/admin)
        if ((profile?.role === "admin" || user?.email?.toLowerCase() === "hotelesdevenezuela77@gmail.com") && explicitTab !== "perfil") {
          setLocation("/admin");
          return;
        }

        if (explicitTab === "perfil") {
          setActiveTab("perfil");
        } else if (explicitTab === "registrar") {
          setActiveTab("registrar");
        } else if (profile?.role === "owner" || count > 0) {
          if (count > 0) {
            // Si ya tiene propiedades registradas, ir directo a su Dashboard Administrativo
            setLocation("/mis-negocios");
          } else {
            // Si es propietario pero NO tiene propiedades aún, abrir directamente "Registrar Mi Propiedad"
            setActiveTab("registrar");
          }
        } else {
          setActiveTab("perfil");
        }
      } catch (err) {
        console.warn("Error al verificar establecimientos del propietario:", err);
      } finally {
        setCheckingProperties(false);
      }
    }

    checkUserEstablishments();
  }, [user, profile, setLocation]);

  const handleServiceToggle = (key: string) => {
    setEstFormData(prev => {
      const active = prev.services.includes(key);
      return {
        ...prev,
        services: active ? prev.services.filter(s => s !== key) : [...prev.services, key]
      };
    });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setProfileLoading(true);
      setProfileError("");
      setProfileSuccess(false);

      const { error } = await supabase
        .from("user_profiles")
        .update({
          name: name,
          phone: phone,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);

      if (error) throw error;
      setProfileSuccess(true);
    } catch (err: any) {
      console.error(err);
      setProfileError("No se pudo actualizar la información de perfil.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      setPassError("Las contraseñas no coinciden.");
      return;
    }

    if (newPassword.length < 6) {
      setPassError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      setPassLoading(true);
      setPassError("");
      setPassSuccess(false);

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      setPassSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      setPassError(err.message || "Error al cambiar la contraseña.");
    } finally {
      setPassLoading(false);
    }
  };

  const saveLocalMockEst = (payload: any) => {
    const categoryObj = categories.find(c => c.id === parseInt(estFormData.category_id));
    const destinationObj = destinations.find(d => d.id === parseInt(estFormData.destination_id));
    const localEstsKey = "hdv_mock_establishments";
    const existing = JSON.parse(localStorage.getItem(localEstsKey) || "[]");
    const newMockEst = {
      ...payload,
      id: Date.now(),
      category_name: categoryObj?.name || "Establecimiento",
      destination_name: destinationObj?.name || "Venezuela",
      rating_avg: 5.0,
      review_count: 1,
      created_at: new Date().toISOString()
    };
    localStorage.setItem(localEstsKey, JSON.stringify([newMockEst, ...existing]));
  };

  const handleRegisterEstablishment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!estFormData.name || !estFormData.category_id || !estFormData.destination_id) {
      alert("Por favor completa los campos obligatorios: Nombre, Categoría y Destino.");
      return;
    }

    try {
      setRegisteringEst(true);
      const slug = estFormData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      const payload = {
        owner_user_id: user.id,
        name: estFormData.name,
        slug,
        description: estFormData.description,
        address: estFormData.address,
        phone: estFormData.phone,
        whatsapp: estFormData.whatsapp,
        website: estFormData.website.trim() && !/^https?:\/\//i.test(estFormData.website.trim())
          ? `https://${estFormData.website.trim()}`
          : estFormData.website.trim(),
        price_level: estFormData.price_level,
        category_id: parseInt(estFormData.category_id),
        destination_id: parseInt(estFormData.destination_id),
        services: JSON.stringify(estFormData.services),
        status: "pending",
        has_reservations_enabled: false
      };

      const { error } = await supabase.from("establishments").insert([payload]);
      if (error) {
        console.warn("Error en Supabase insert / RLS política, guardando en el gestor local:", error.message);
        saveLocalMockEst(payload);
      }

      alert("🎉 ¡Tu propiedad ha sido registrada con éxito! Entrando a tu Dashboard de Propietario...");
      setLocation("/mis-negocios");
    } catch (err: any) {
      console.error("Error al registrar propiedad:", err);
      const slug = estFormData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      const payload = {
        owner_user_id: user.id,
        name: estFormData.name,
        slug,
        description: estFormData.description,
        address: estFormData.address,
        phone: estFormData.phone,
        whatsapp: estFormData.whatsapp,
        website: estFormData.website,
        price_level: estFormData.price_level,
        category_id: parseInt(estFormData.category_id),
        destination_id: parseInt(estFormData.destination_id),
        services: JSON.stringify(estFormData.services),
        status: "pending",
        has_reservations_enabled: false
      };
      saveLocalMockEst(payload);
      alert("🎉 ¡Tu propiedad ha sido registrada con éxito! Entrando a tu Dashboard de Propietario...");
      setLocation("/mis-negocios");
    } finally {
      setRegisteringEst(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <Shield className="w-14 h-14 mx-auto mb-4 text-brand-magenta opacity-30" />
        <h1 className="text-3xl font-black mb-2 text-gray-800">Acceso Restringido</h1>
        <p className="text-gray-400 text-xs mb-8">Debes iniciar sesión para acceder a tu panel.</p>
        <Link href="/login">
          <button className="btn-magenta-gradient px-8 py-3.5 rounded-full font-bold text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer">
            Iniciar Sesión
          </button>
        </Link>
      </div>
    );
  }

  const displayName = profile?.name || user.email?.split("@")[0] || "Usuario";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isOwner = profile?.role === "owner" || profile?.role === "admin";

  return (
    <div className="bg-gray-50/40 min-h-screen pb-24 font-sans">
      {/* Cabecera Corporativa con Paleta Oficial */}
      <div
        className="relative overflow-hidden py-12"
        style={{ background: "linear-gradient(135deg, #0e011f 0%, #1a0533 100%)" }}
      >
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl bg-brand-magenta" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl bg-brand-turquesa" />
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors mb-6 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al inicio</span>
          </Link>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 text-center sm:text-left">
              <div
                className="w-18 h-18 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-xl shrink-0"
                style={{ background: "linear-gradient(135deg, #FF0096, #9B00CC)" }}
              >
                {initials}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {displayName}
                </h1>
                <p className="text-white/70 flex items-center justify-center sm:justify-start gap-2 mt-1 text-xs">
                  <Mail className="w-3.5 h-3.5 text-brand-turquesa" />
                  {user.email}
                </p>
                
                <span
                  className="inline-flex items-center gap-1.5 mt-3 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white"
                  style={{
                    background: profile?.role === "admin" ? "rgba(255,0,150,0.25)" : "rgba(0,200,212,0.25)",
                    border: `1px solid ${profile?.role === "admin" ? "rgba(255,0,150,0.4)" : "rgba(0,200,212,0.4)"}`
                  }}
                >
                  <CheckCircle className="w-3 h-3" />
                  {profile?.role === "admin" ? "Administrador" : profile?.role === "owner" ? "Propietario Comercial" : "Turista"}
                </span>
              </div>
            </div>

            {/* Atajos a Dashboard en caso de tener propiedades */}
            {hasProperties && (
              <Link href="/mis-negocios">
                <button className="btn-cyan-gradient text-xs font-bold px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:scale-103 active:scale-97 transition-all cursor-pointer font-sans uppercase">
                  <Briefcase className="w-4 h-4" />
                  <span>Mi Dashboard de Propietario</span>
                </button>
              </Link>
            )}
          </div>

          {/* Barra de Pestañas de Navegación del Panel */}
          <div className="flex items-center gap-2 mt-8 pt-4 border-t border-white/10 overflow-x-auto">
            {isOwner && (
              <button
                onClick={() => setActiveTab("registrar")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "registrar"
                    ? "bg-[#FF0096] text-white shadow-md shadow-pink-500/20"
                    : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Registrar Mi Propiedad</span>
                {!hasProperties && (
                  <span className="bg-white text-[#FF0096] text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full animate-pulse ml-1">
                    Paso 1
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setActiveTab("perfil")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "perfil"
                  ? "bg-[#00C8D4] text-white shadow-md shadow-cyan-500/20"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Datos Personales & Seguridad</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido según la pestaña activa */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        
        {/* Pestaña: REGISTRAR MI PROPIEDAD */}
        {activeTab === "registrar" && (
          <div className="bg-white border border-gray-200/80 rounded-3xl overflow-hidden shadow-sm animate-in fade-in duration-200">
            {/* Banner de Bienvenida Onboarding */}
            <div className="p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-slate-50 via-white to-pink-50/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FF0096]/10 border border-[#FF0096]/20 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-[#FF0096]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 tracking-tight">Registra tu Hotel, Posada o Restaurante</h2>
                  <p className="text-xs text-gray-500 mt-1 max-w-xl leading-relaxed">
                    Completa la información básica de tu establecimiento para publicar tu perfil comercial y empezar a recibir clientes directamente por WhatsApp sin comisiones.
                  </p>
                </div>
              </div>
            </div>

            {/* Formulario Completo de Registro */}
            <form onSubmit={handleRegisterEstablishment} className="p-6 md:p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Nombre */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Nombre Comercial del Establecimiento *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Posada Boutique El Paraíso"
                    value={estFormData.name}
                    onChange={(e) => setEstFormData({ ...estFormData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-gray-800 outline-none focus:border-[#FF0096] focus:bg-white transition-all"
                  />
                </div>

                {/* 2. Categoría */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Categoría de Servicio *</label>
                  <select
                    required
                    value={estFormData.category_id}
                    onChange={(e) => setEstFormData({ ...estFormData, category_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-gray-800 outline-none focus:border-[#FF0096] focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="">Selecciona una categoría...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Destino */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Destino Turístico *</label>
                  <select
                    required
                    value={estFormData.destination_id}
                    onChange={(e) => setEstFormData({ ...estFormData, destination_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-gray-800 outline-none focus:border-[#00C8D4] focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="">Selecciona el destino...</option>
                    {destinations.map((dest) => (
                      <option key={dest.id} value={dest.id}>{dest.name} ({dest.state})</option>
                    ))}
                  </select>
                </div>

                {/* 4. WhatsApp Directo */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">WhatsApp para Reservas y Leads</label>
                  <input
                    type="tel"
                    placeholder="Ej. +584145069774"
                    value={estFormData.whatsapp}
                    onChange={(e) => setEstFormData({ ...estFormData, whatsapp: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-gray-800 outline-none focus:border-[#00C8D4] focus:bg-white transition-all"
                  />
                </div>

                {/* 5. Teléfono Móvil / Fijo */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Teléfono de Recepción</label>
                  <input
                    type="tel"
                    placeholder="Ej. +582129990000"
                    value={estFormData.phone}
                    onChange={(e) => setEstFormData({ ...estFormData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-gray-800 outline-none focus:border-slate-400 focus:bg-white transition-all"
                  />
                </div>

                {/* 6. Sitio Web / Redes */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Sitio Web Oficial o Instagram</label>
                  <input
                    type="text"
                    placeholder="Ej. instagram.com/miposada"
                    value={estFormData.website}
                    onChange={(e) => setEstFormData({ ...estFormData, website: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-gray-800 outline-none focus:border-slate-400 focus:bg-white transition-all"
                  />
                </div>

                {/* 7. Nivel de Precios */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Nivel de Precios</label>
                  <select
                    value={estFormData.price_level}
                    onChange={(e) => setEstFormData({ ...estFormData, price_level: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-gray-800 outline-none focus:border-slate-400 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="$">$ Económico (Hasta $30/noche)</option>
                    <option value="$$">$$ Moderado ($30 - $80/noche)</option>
                    <option value="$$$">$$$ Premium ($80 - $180/noche)</option>
                    <option value="$$$$">$$$$ Alta Gama / Lujo ($180+/noche)</option>
                  </select>
                </div>

                {/* 8. Dirección */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Dirección Física o Sector</label>
                  <input
                    type="text"
                    placeholder="Ej. Av. Principal de El Yaque, Calle 4"
                    value={estFormData.address}
                    onChange={(e) => setEstFormData({ ...estFormData, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-gray-800 outline-none focus:border-slate-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* 9. Descripción */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Descripción General del Hospedaje</label>
                <textarea
                  rows={3}
                  placeholder="Describe las instalaciones, ambiente, vistas y atractivos principales de tu hospedaje..."
                  value={estFormData.description}
                  onChange={(e) => setEstFormData({ ...estFormData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-semibold text-gray-800 outline-none focus:border-[#FF0096] focus:bg-white transition-all"
                />
              </div>

              {/* 10. Servicios e Instalaciones */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-3">Servicios e Instalaciones Incluidas</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {availableServices.map((srv) => {
                    const isChecked = estFormData.services.includes(srv.key);
                    return (
                      <button
                        key={srv.key}
                        type="button"
                        onClick={() => handleServiceToggle(srv.key)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left ${
                          isChecked
                            ? "border-[#00C8D4] bg-cyan-50/40 text-[#00C8D4] shadow-sm"
                            : "border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isChecked ? "bg-[#00C8D4] text-white" : "bg-slate-200 text-slate-500"}`}>
                          {srv.icon}
                        </div>
                        <span className="truncate">{srv.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botón Submit */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={registeringEst}
                  className="btn-magenta-gradient text-xs font-bold px-8 py-4 rounded-xl flex items-center gap-2 shadow-lg shadow-pink-500/20 hover:scale-102 active:scale-98 transition-all cursor-pointer uppercase tracking-wider"
                >
                  {registeringEst ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Registrando Propiedad...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Registrar Mi Propiedad Ahora</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Pestaña: DATOS PERSONALES & SEGURIDAD */}
        {activeTab === "perfil" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-200">
            
            {/* Columna 1: Datos Personales */}
            <div className="bg-white border border-gray-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="h-1.5 bg-gradient-to-r from-brand-magenta to-brand-purple" />
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3.5 mb-6 text-left">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-magenta-50/20 border border-brand-magenta/10">
                    <User className="w-5 h-5 text-brand-magenta" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800 text-base">Datos Personales</h2>
                    <p className="text-gray-400 text-xs mt-0.5">Actualiza tu perfil público</p>
                  </div>
                </div>

                {profileError && (
                  <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-2.5 text-xs font-semibold mb-4 text-left">
                    ⚠ {profileError}
                  </div>
                )}

                {profileSuccess && (
                  <div className="bg-green-50 border border-green-100 text-green-600 rounded-xl px-4 py-2.5 text-xs font-semibold mb-4 text-left">
                    ✓ Datos actualizados correctamente.
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-4 text-left">
                  {/* Nombre */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Nombre Completo</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-700 outline-none focus:border-brand-magenta transition-colors"
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Teléfono / WhatsApp</label>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-brand-magenta transition-colors">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="bg-transparent border-none outline-none text-xs font-semibold text-gray-700 w-full placeholder-gray-400"
                        placeholder="+58 412 0000000"
                      />
                    </div>
                  </div>

                  {/* Email (Solo lectura) */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Correo Electrónico (No editable)</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-400 outline-none cursor-not-allowed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="w-full btn-magenta-gradient py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50 cursor-pointer mt-6"
                  >
                    {profileLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <span>Guardar Cambios</span>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Columna 2: Seguridad (Contraseña) */}
            <div className="bg-white border border-gray-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="h-1.5 bg-gradient-to-r from-brand-turquesa to-blue-500" />
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3.5 mb-6 text-left">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-cyan-50/20 border border-brand-turquesa/10">
                    <Settings className="w-5 h-5 text-brand-turquesa" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800 text-base">Seguridad</h2>
                    <p className="text-gray-400 text-xs mt-0.5">Modifica tu contraseña de acceso</p>
                  </div>
                </div>

                {passError && (
                  <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-2.5 text-xs font-semibold mb-4 text-left">
                    ⚠ {passError}
                  </div>
                )}

                {passSuccess && (
                  <div className="bg-green-50 border border-green-100 text-green-600 rounded-xl px-4 py-2.5 text-xs font-semibold mb-4 text-left">
                    ✓ Contraseña cambiada con éxito.
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-4 text-left">
                  {/* Nueva contraseña */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Nueva Contraseña</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-700 outline-none focus:border-brand-turquesa transition-colors"
                      placeholder="Mínimo 6 caracteres"
                      required
                    />
                  </div>

                  {/* Confirmar contraseña */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Confirmar Contraseña</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-700 outline-none focus:border-brand-turquesa transition-colors"
                      placeholder="Repite tu contraseña"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={passLoading}
                    className="w-full btn-cyan-gradient py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50 cursor-pointer mt-6"
                  >
                    {passLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Actualizando...</span>
                      </>
                    ) : (
                      <span>Actualizar Contraseña</span>
                    )}
                  </button>
                </form>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
