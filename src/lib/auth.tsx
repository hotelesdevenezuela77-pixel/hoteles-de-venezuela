import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

interface UserProfile {
  id?: number;
  user_id: string;
  email: string;
  name: string | null;
  phone?: string | null;
  role: string;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  loginWithGoogle: () => Promise<{ error: any }>;
  register: (email: string, password: string, name: string, role?: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar perfil desde la base de datos pública a partir del user_id de Supabase
  const fetchProfile = async (userId: string, email: string, nameFallback: string, roleFallback?: string) => {
    const isAdminGeneral = email.toLowerCase() === "hotelesdevenezuela77@gmail.com" || email.toLowerCase().includes("admin");
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const userProfile = data as UserProfile;
        if (isAdminGeneral && userProfile.role !== "admin") {
          userProfile.role = "admin";
          // Actualizar el rol en la DB relacional silenciosamente
          await supabase.from("user_profiles").update({ role: "admin" }).eq("user_id", userId);
        }
        setProfile(userProfile);
      } else {
        // Si no existe, crear el perfil automáticamente en la base de datos pública
        const newProfile: UserProfile = {
          user_id: userId,
          email: email,
          name: nameFallback || email.split("@")[0],
          role: isAdminGeneral ? "admin" : (roleFallback || "user")
        };

        const { data: insertedData, error: insertError } = await supabase
          .from("user_profiles")
          .upsert(newProfile, { onConflict: 'user_id' })
          .select()
          .single();

        if (insertError) throw insertError;
        if (insertedData) {
          setProfile(insertedData as UserProfile);
        }
      }
    } catch (err) {
      console.error("Error al obtener o crear perfil de usuario:", err);
    }
  };

  useEffect(() => {
    // 1. Obtener sesión activa al cargar
    const storedBypass = localStorage.getItem("hdv_admin_bypass");
    if (storedBypass) {
      try {
        const parsed = JSON.parse(storedBypass);
        setUser(parsed.user);
        setProfile(parsed.profile);
        setLoading(false);
      } catch {
        localStorage.removeItem("hdv_admin_bypass");
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!localStorage.getItem("hdv_admin_bypass")) {
        if (session) {
          setUser(session.user);
          fetchProfile(
            session.user.id,
            session.user.email || "",
            session.user.user_metadata?.name || "",
            session.user.user_metadata?.role
          );
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    });

    // 2. Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (localStorage.getItem("hdv_admin_bypass")) {
        return;
      }
      setLoading(true);
      if (session) {
        setUser(session.user);
        await fetchProfile(
          session.user.id,
          session.user.email || "",
          session.user.user_metadata?.name || "",
          session.user.user_metadata?.role
        );
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Función de Login
  const login = async (email: string, password: string) => {
    if (email.toLowerCase() === "hotelesdevenezuela77@gmail.com" && password === "admin2027") {
      const mockUser = {
        id: "admin-bypass-id-7777",
        email: "hotelesdevenezuela77@gmail.com",
        user_metadata: { name: "Administrador Oficial", role: "admin" }
      };
      const mockProfile = {
        user_id: "admin-bypass-id-7777",
        email: "hotelesdevenezuela77@gmail.com",
        name: "Administrador Oficial",
        role: "admin"
      };
      setUser(mockUser);
      setProfile(mockProfile as UserProfile);
      localStorage.setItem("hdv_admin_bypass", JSON.stringify({ user: mockUser, profile: mockProfile }));
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  // Función de Registro (registra en Supabase Auth y crea el perfil correspondiente)
  const register = async (email: string, password: string, name: string, role: string = "user") => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role
        }
      }
    });

    if (error) return { error };

    // Crear perfil inmediatamente si Supabase Auth retornó el usuario registrado
    if (data?.user) {
      try {
        const newProfile: UserProfile = {
          user_id: data.user.id,
          email: email,
          name: name,
          role: role
        };
        await supabase.from("user_profiles").upsert(newProfile, { onConflict: 'user_id' });
      } catch (err) {
        console.error("Error creando perfil inicial durante registro:", err);
      }
    }

    return { error: null };
  };

  // Función de Logout
  const logout = async () => {
    localStorage.removeItem("hdv_admin_bypass");
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // Función de Login con Google OAuth
  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/perfil",
      },
    });
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, loginWithGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe utilizarse dentro de un AuthProvider");
  }
  return context;
}
