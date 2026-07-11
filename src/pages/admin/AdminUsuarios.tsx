import { useAuth } from "@/lib/auth";
import { logActivity } from "../../lib/activityLogger";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { Users, Search, Loader2 } from "lucide-react";

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string;
  createdAt: string;
}

const ROLES: Record<string, { label: string; bg: string; text: string }> = {
  admin:          { label: "Admin",        bg: "#FCE7F3", text: "#9D174D" },
  superadmin:     { label: "Super Admin",  bg: "#EDE9FE", text: "#5B21B6" },
  owner:          { label: "Propietario",  bg: "#DBEAFE", text: "#1E40AF" },
  user:           { label: "Usuario",      bg: "#F3F4F6", text: "#374151" },
  agent:          { label: "Agente",       bg: "#FEF3C7", text: "#92400E" },
  business_owner: { label: "Empresa",      bg: "#D1FAE5", text: "#065F46" },
};

function formatSafeDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    const normalized = dateStr.includes(" ") ? dateStr.replace(" ", "T") : dateStr;
    const date = new Date(normalized);
    if (isNaN(date.getTime())) {
      return "—";
    }
    return date.toLocaleDateString("es-VE");
  } catch (e) {
    return "—";
  }
}

export function AdminUsuarios() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, nav] = useLocation();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      nav("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Query to fetch all users from profiles
  const { data: allUsers = [], isLoading: loading } = useQuery<UserRow[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Merge with mock users from localStorage if any
      const localUsersKey = "hdv_mock_users";
      let localUsers: any[] = [];
      try {
        const stored = localStorage.getItem(localUsersKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            localUsers = parsed;
          }
        }
      } catch (err) {
        console.error("Error parsing local users:", err);
      }
      const combined = [...(data || []), ...localUsers];

      return combined.map((u: any) => ({
        id: u.user_id || u.id,
        email: u.email || "",
        name: u.name || "",
        role: u.role || "user",
        phone: u.phone || "",
        createdAt: u.created_at || new Date().toISOString()
      }));
    }
  });

  // Mutation to update role
  const changeRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const strId = String(id);
      // If it's a mock user (starts with "usr"), update local storage
      if (strId.startsWith("usr")) {
        const localUsersKey = "hdv_mock_users";
        let localUsers: any[] = [];
        try {
          const stored = localStorage.getItem(localUsersKey);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              localUsers = parsed;
            }
          }
        } catch (err) {
          console.error("Error parsing local users in changeRole:", err);
        }
        const updated = localUsers.map((u: any) => String(u.id) === strId ? { ...u, role } : u);
        localStorage.setItem(localUsersKey, JSON.stringify(updated));
        return { success: true };
      }

      const { error } = await supabase
        .from("user_profiles")
        .update({ role })
        .eq("user_id", id);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, variables) => {
      // Buscar el usuario editado para obtener su email
      const editedUser = allUsers.find(u => String(u.id) === String(variables.id));
      const targetEmail = editedUser?.email || "usuario@hotelesdevenezuela.com";
      
      logActivity(
        user?.id || null,
        user?.email || "hotelesdevenezuela77@gmail.com",
        "UPDATE_ROLE",
        `Cambio de rol del usuario ${targetEmail} a ${variables.role.toUpperCase()}.`
      );
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    }
  });

  const users = allUsers.filter(u =>
    !search || 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
        <p className="text-gray-500 text-xs font-bold">Verificando credenciales de seguridad...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 pb-24">
      {/* Header */}
      <div className="relative overflow-hidden py-7" style={{ background: "linear-gradient(135deg, #0e0120, #1a0533)" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: "#FF0096" }} />
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-brand-magenta/20">
              <Users className="w-4 h-4 text-brand-magenta" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Usuarios</h1>
              <p className="text-white/50 text-xs font-semibold">{allUsers.length} usuarios registrados en el sistema</p>
            </div>
          </div>
        </div>
      </div>

      <AdminTabBar />

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por email o nombre..."
            className="w-full max-w-sm bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-purple-400 font-semibold shadow-xs text-gray-700"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500" />

          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50 border-b border-slate-100 font-bold text-[10px] uppercase tracking-wider text-slate-500">
            <span className="col-span-4">Usuario</span>
            <span className="col-span-2">Rol</span>
            <span className="col-span-3">Teléfono</span>
            <span className="col-span-2">Registro</span>
            <span className="col-span-1 text-right">Cambiar</span>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-400 text-xs font-bold">
              <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-2" />
              Cargando usuarios...
            </div>
          ) : users.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-xs font-semibold">
              No hay usuarios que coincidan con la búsqueda
            </div>
          ) : users.map(u => {
            const roleInfo = ROLES[u.role] ?? { label: u.role, bg: "#F1F5F9", text: "#475569" };
            return (
              <div key={u.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 items-center hover:bg-purple-50/10 transition-colors last:border-b-0">
                <div className="col-span-4 min-w-0">
                  <div className="font-bold text-gray-800 text-sm truncate">{u.name || u.email.split("@")[0]}</div>
                  <div className="text-xs text-gray-400 font-medium truncate mt-0.5">{u.email}</div>
                </div>
                <div className="col-span-2">
                  <span
                    className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-white/20"
                    style={{ background: roleInfo.bg, color: roleInfo.text }}
                  >
                    {roleInfo.label}
                  </span>
                </div>
                <div className="col-span-3 text-xs text-gray-500 font-semibold">{u.phone || "—"}</div>
                <div className="col-span-2 text-xs text-gray-450 font-semibold">{formatSafeDate(u.createdAt)}</div>
                <div className="col-span-1 flex justify-end">
                  <select
                    value={u.role}
                    onChange={e => changeRole.mutate({ id: u.id, role: e.target.value })}
                    className="bg-slate-50 border border-slate-200 hover:border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-purple-400 font-bold text-slate-600 transition-colors cursor-pointer"
                    disabled={changeRole.isPending}
                  >
                    {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
            );
          })}
        </div>

        {users.length > 0 && (
          <p className="text-xs font-bold text-gray-400 mt-3 text-right">{users.length} de {allUsers.length} usuarios</p>
        )}
      </div>
    </div>
  );
}
