import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard, CheckSquare, Building2, ArrowUpDown, Users,
  Tag, MapPin, FileText, Globe, Star, MessageSquare, Leaf,
  Map, TreePine, Repeat2, Sparkles, Receipt, Briefcase,
  BarChart3, Mail, Newspaper, Search, Link2, Settings, CalendarDays, Package, DollarSign,
  ClipboardList, Bot, Network, Shield
} from "lucide-react";

interface TabCounts {
  establishments?: number;
  pending?: number;
  users?: number;
  categories?: number;
  destinations?: number;
}

const TABS = [
  { href: "/admin",                    label: "Resumen",           icon: LayoutDashboard, countKey: undefined         },
  { href: "/admin/aprobaciones",       label: "Aprobaciones",      icon: CheckSquare,     countKey: "pending"         },
  { href: "/admin/establecimientos",   label: "Establecimientos",  icon: Building2,       countKey: "establishments"  },
  { href: "/admin/prioridades",        label: "Prioridades",       icon: ArrowUpDown,     countKey: undefined         },
  { href: "/admin/reservas",           label: "Reservas",          icon: CalendarDays,    countKey: undefined         },
  { href: "/admin/paquetes",           label: "Paquetes",          icon: Package,         countKey: undefined         },
  { href: "/admin/usuarios",           label: "Usuarios",          icon: Users,           countKey: "users"           },
  { href: "/admin/categorias",         label: "Categorías",        icon: Tag,             countKey: "categories"      },
  { href: "/admin/destinos",           label: "Destinos",          icon: MapPin,          countKey: "destinations"    },
  { href: "/admin/contenido",          label: "Contenido",         icon: FileText,        countKey: undefined         },
  { href: "/admin/seo",                label: "Páginas SEO",       icon: Globe,           countKey: undefined         },
  { href: "/centaurus",                label: "Centaurus",         icon: Star,            countKey: undefined         },
  { href: "/crm",                      label: "WhatsApp CRM",      icon: MessageSquare,   countKey: undefined         },
  { href: "/admin/ia-conversacional",  label: "Agente IA",         icon: Bot,             countKey: undefined         },
  { href: "/admin/clientes",           label: "Base de Clientes",  icon: Users,           countKey: undefined         },
  { href: "/admin/tips",               label: "Tips Turismo",      icon: Leaf,            countKey: undefined         },
  { href: "/admin/sitios",             label: "Sitios Turísticos", icon: Map,             countKey: undefined         },
  { href: "/admin/parques",            label: "Parques Nacionales",icon: TreePine,        countKey: undefined         },
  { href: "/admin/b2b",                label: "B2B Transacciones", icon: Repeat2,         countKey: undefined         },
  { href: "/andromeda",                label: "Andromeda",         icon: Sparkles,        countKey: undefined         },
  { href: "/admin/cotizaciones",       label: "Cotizaciones",      icon: Receipt,         countKey: undefined         },
  { href: "/admin/comercial",          label: "Gestión Comercial", icon: Briefcase,       countKey: undefined         },
  { href: "/admin/analiticas",         label: "Analíticas",        icon: BarChart3,       countKey: undefined         },
  { href: "/admin/correos",            label: "Correos Auto",      icon: Mail,            countKey: undefined         },
  { href: "/admin/blog",               label: "Blog",              icon: Newspaper,       countKey: undefined         },
  { href: "/admin/seo-home",           label: "SEO Home",          icon: Search,          countKey: undefined         },
  { href: "/admin/linkhub",            label: "Link Hub",          icon: Link2,           countKey: undefined         },
  { href: "/admin/config",             label: "Configuración",     icon: Settings,        countKey: undefined         },
  { href: "/admin/finanzas",           label: "Finanzas",          icon: DollarSign,      countKey: undefined         },
  { href: "/admin/pagos",              label: "Verificar Pagos",   icon: Receipt,         countKey: undefined         },
  { href: "/admin/solicitudes",        label: "Solicitudes",       icon: ClipboardList,   countKey: undefined         },
  { href: "/admin/reservas-paquetes",  label: "Reservas Paquetes", icon: Package,         countKey: undefined         },
  { href: "/admin/reseñas",            label: "Reseñas",           icon: Star,            countKey: undefined         },
  { href: "/admin/saas",               label: "Gestión SaaS",      icon: Network,         countKey: undefined         },
  { href: "/admin/logs",               label: "Auditoría Logs",    icon: Shield,          countKey: undefined         },
];

const FUCSIA = "#FF0096";

export function AdminTabBar() {
  const [location] = useLocation();
  const [counts, setCounts] = useState<TabCounts>({});

  const isActive = (href: string) => {
    if (href === "/admin") return location === "/admin";
    return location.startsWith(href);
  };

  useEffect(() => {
    async function loadCounts() {
      try {
        // Fetch establishments count
        const { count: estCount } = await supabase
          .from("establishments")
          .select("*", { count: "exact", head: true });

        // Fetch pending count
        const { count: pendCount } = await supabase
          .from("establishments")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");

        // Fetch users count
        const { count: usrCount } = await supabase
          .from("user_profiles")
          .select("*", { count: "exact", head: true });

        // Fetch categories count
        const { count: catCount } = await supabase
          .from("categories")
          .select("*", { count: "exact", head: true });

        // Fetch destinations count
        const { count: destCount } = await supabase
          .from("destinations")
          .select("*", { count: "exact", head: true });

        // Merge with mock values from local storage
        let localUsersCount = 0;
        let localCatsCount = 0;
        let localDestsCount = 0;

        try {
          const uStr = localStorage.getItem("hdv_mock_users");
          if (uStr) {
            const parsed = JSON.parse(uStr);
            if (Array.isArray(parsed)) localUsersCount = parsed.length;
          }
        } catch (e) {
          console.error("Error parsing local users in TabBar:", e);
        }

        try {
          const cStr = localStorage.getItem("hdv_mock_categories");
          if (cStr) {
            const parsed = JSON.parse(cStr);
            if (Array.isArray(parsed)) localCatsCount = parsed.length;
          }
        } catch (e) {
          console.error("Error parsing local categories in TabBar:", e);
        }

        try {
          const dStr = localStorage.getItem("hdv_mock_destinations");
          if (dStr) {
            const parsed = JSON.parse(dStr);
            if (Array.isArray(parsed)) localDestsCount = parsed.length;
          }
        } catch (e) {
          console.error("Error parsing local destinations in TabBar:", e);
        }

        setCounts({
          establishments: (estCount || 0),
          pending: (pendCount || 0),
          users: (usrCount || 0) + localUsersCount,
          categories: (catCount || 0) + localCatsCount,
          destinations: (destCount || 0) + localDestsCount,
        });
      } catch (err) {
        console.error("Failed to fetch admin counts:", err);
      }
    }

    loadCounts();
  }, [location]);

  const getCount = (countKey?: string) => {
    if (!countKey) return undefined;
    return counts[countKey as keyof TabCounts];
  };

  return (
    <div className="bg-[#100720]/90 border-b border-white/5 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-nowrap md:flex-wrap overflow-x-auto md:overflow-visible gap-2 pb-1.5 no-scrollbar" style={{ WebkitOverflowScrolling: "touch" }}>
          {TABS.map((tab) => {
            const active = isActive(tab.href);
            const cnt = getCount(tab.countKey);
            return (
              <Link key={tab.href} href={tab.href}>
                <button
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium tracking-wide transition-all whitespace-nowrap cursor-pointer hover:opacity-90 active:scale-95"
                  style={{
                    background: active ? `linear-gradient(135deg, ${FUCSIA}, #D80073)` : "rgba(255, 255, 255, 0.05)",
                    color: active ? "white" : "#cbd5e1",
                    border: `1px solid ${active ? FUCSIA : "rgba(255, 255, 255, 0.08)"}`,
                    boxShadow: active ? "0 4px 12px rgba(255,0,150,0.2)" : "none",
                    flexShrink: 0,
                  }}
                >
                  <tab.icon className="w-3.5 h-3.5 shrink-0" />
                  {tab.label}
                  {cnt !== undefined && cnt > 0 && (
                    <span
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black"
                      style={{
                        background: active ? "rgba(255,255,255,0.25)" : FUCSIA,
                        color: "white",
                        marginLeft: "4px"
                      }}
                    >
                      {cnt}
                    </span>
                  )}
                </button>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
