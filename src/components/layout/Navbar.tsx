import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  Map, Menu, X, ChevronDown, Sparkles, Briefcase, LogOut, Heart, User, Globe, ShieldAlert, Receipt, Phone
} from "lucide-react";
import { useAuth } from "../../lib/auth";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [location] = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const [compareCount, setCompareCount] = useState(0);

  const { user, profile, logout } = useAuth();

  useEffect(() => {
    const updateCompareCount = () => {
      const stored = localStorage.getItem("hdv_compare_list");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCompareCount(Array.isArray(parsed) ? parsed.length : 0);
        } catch {
          setCompareCount(0);
        }
      } else {
        setCompareCount(0);
      }
    };

    updateCompareCount();
    window.addEventListener("hdv_compare_updated", updateCompareCount);
    return () => window.removeEventListener("hdv_compare_updated", updateCompareCount);
  }, []);

  const NAV_LINKS = [
    { href: "/establecimientos", label: "Explorar" },
    { href: "/destinos", label: "Destinos" },
    { href: "/mapa", label: "Mapa", icon: <Map className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" /> },
    { href: "/parques", label: "Parques" },
    { href: "/servicios-b2b", label: "Servicios B2B" },
    { href: "/paquetes", label: "Paquetes" },
    { href: "/membresias", label: "Membresías" },
    { href: "/comparar", label: compareCount > 0 ? `Comparar (${compareCount})` : "Comparar" }
  ];

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setLangOpen(false);
  }, [location]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const userInitials = profile?.name
    ? profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[60px] flex items-center justify-between gap-4">
        
        {/* Logotipo Oficial */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img
            src="/images/logo-hdv-transparent.png"
            alt="Hoteles de Venezuela"
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Navegación para Escritorio */}
        <nav className="hidden xl:flex items-center gap-1 text-xs font-semibold text-gray-600">
          {NAV_LINKS.filter(l => l.href !== "/comparar" && l.href !== "/servicios-b2b").map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-2 py-1.5 rounded-md transition-colors whitespace-nowrap hover:text-brand-magenta hover:bg-magenta-50/10 ${
                location === l.href ? "text-brand-magenta font-bold" : ""
              }`}
            >
              {l.icon}
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Sección Derecha */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Teléfono de contacto oficial para verificación */}
          <a
            href="https://wa.me/584145069774"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
            title="Contacto oficial WhatsApp"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>+58 414-5069774</span>
          </a>

          {/* Selector de Idioma */}
          <div className="relative hidden md:block" ref={langRef}>
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>ES</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-xl shadow-xl py-1 z-50 border border-gray-100">
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 bg-pink-50 text-brand-magenta font-bold"
                  onClick={() => setLangOpen(false)}
                >
                  🇻🇪 Español <span className="ml-auto">✓</span>
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                  onClick={() => setLangOpen(false)}
                >
                  🇺🇸 English
                </button>
              </div>
            )}
          </div>

          {/* Botón de Enlaces Bio */}
          <Link
            href="/links"
            className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center shrink-0 transition-all duration-300 hover:scale-105"
            style={{ background: "linear-gradient(135deg, #00C8D4, #0099AA)" }}
            title="Enlaces de Redes"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </Link>

          {/* Autenticación */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full hover:bg-gray-50 transition-colors border border-gray-100"
                onClick={() => setUserMenuOpen((v) => !v)}
              >
                <div 
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black shadow-sm"
                  style={{ background: "linear-gradient(135deg, #FF0096, #9B00CC)" }}
                >
                  {userInitials}
                </div>
                <span className="hidden md:block text-xs font-semibold text-gray-600 max-w-[80px] truncate">
                  {profile?.name?.split(" ")[0] ?? user.email?.split("@")[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-50">
                    <p className="text-xs text-gray-800 truncate font-mono font-bold">{user.email}</p>
                    <p className="text-[10px] text-brand-magenta font-black uppercase tracking-wider mt-0.5">
                      {profile?.role === "admin" ? "Administrador" 
                       : profile?.role === "owner" ? "Propietario" 
                       : "Turista"}
                    </p>
                  </div>
                  <div className="py-1">
                    {(profile?.role === "admin" || user?.email?.toLowerCase() === "hotelesdevenezuela77@gmail.com") && (
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-pink-50 hover:text-brand-magenta transition-colors font-bold text-brand-turquesa">
                        <ShieldAlert className="w-3.5 h-3.5 text-brand-turquesa animate-pulse" /> Panel de Administración
                      </Link>
                    )}
                    <Link href="/perfil" className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-pink-50 hover:text-brand-magenta transition-colors">
                      <Heart className="w-3.5 h-3.5 text-brand-magenta" /> Mi Perfil / Favoritos
                    </Link>
                    <Link href="/mis-negocios" className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-pink-50 hover:text-brand-magenta transition-colors">
                      <Briefcase className="w-3.5 h-3.5 text-brand-turquesa" /> Mis Establecimientos
                    </Link>
                    <Link href="/andromeda" className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-pink-50 hover:text-brand-magenta transition-colors">
                      <Sparkles className="w-3.5 h-3.5 text-brand-purple" /> Panel Andromeda
                    </Link>
                    <Link href="/reportar-pago" className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-pink-50 hover:text-brand-magenta transition-colors">
                      <Receipt className="w-3.5 h-3.5 text-brand-magenta" /> Reportar Pago local
                    </Link>
                  </div>
                  <div className="border-t border-gray-50 pt-1">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                href="/login"
                className="hidden sm:block text-xs font-bold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/registro"
                className="hidden sm:block btn-magenta-gradient text-xs font-bold px-4 py-1.5 rounded-full shadow-sm hover:scale-103 active:scale-97 transition-all"
              >
                Registrarse
              </Link>
            </div>
          )}

          {/* Menú Móvil Hamburger */}
          <button
            className="xl:hidden p-2 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menú Móvil */}
      {mobileOpen && (
        <div className="xl:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-1 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                location === l.href 
                  ? "text-brand-magenta bg-pink-50/30" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {l.icon}
              {l.label}
            </Link>
          ))}
          
          <Link
            href="/links"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-brand-turquesa hover:bg-gray-50 transition-all"
          >
            <Sparkles className="w-4 h-4 text-brand-turquesa" />
            <span>Enlaces de Redes</span>
          </Link>
          
          {!user ? (
            <div className="flex gap-2 pt-3 mt-2 border-t border-gray-100">
              <Link
                href="/login"
                className="flex-1 text-center py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/registro"
                className="flex-1 text-center py-2 rounded-xl text-xs font-bold btn-magenta-gradient transition-all"
              >
                Registrarse
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-gray-100">
              {(profile?.role === "admin" || user?.email?.toLowerCase() === "hotelesdevenezuela77@gmail.com") && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-brand-turquesa hover:bg-gray-50"
                >
                  <ShieldAlert className="w-4 h-4 text-brand-turquesa" /> Panel de Administración
                </Link>
              )}
              <Link
                href="/perfil"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                <User className="w-4 h-4" /> Mi Perfil / Favoritos
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" /> Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
