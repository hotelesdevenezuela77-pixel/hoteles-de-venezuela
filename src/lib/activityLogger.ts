import { supabase } from "./supabase";

export interface ActivityLog {
  id: string;
  user_id: string | null;
  email: string;
  action: string;
  details: string;
  created_at: string;
}

export async function logActivity(userId: string | null, email: string, action: string, details: string) {
  const newLog: ActivityLog = {
    id: crypto.randomUUID(),
    user_id: userId,
    email: email || "anonimo@hotelesdevenezuela.com",
    action,
    details,
    created_at: new Date().toISOString()
  };

  try {
    // 1. Guardar en Supabase (tabla activity_logs si existe)
    const { error } = await supabase.from("activity_logs").insert([newLog]);
    if (error) {
      console.warn("[Auditoría] Falló el registro de log remoto en Supabase:", error);
    }
  } catch (err) {
    console.warn("[Auditoría] Error registrando log en base de datos remota:", err);
  }

  // 2. Guardar en localStorage como simulación/respaldo robusto
  try {
    const localKey = "hdv_activity_logs";
    const existing = localStorage.getItem(localKey);
    const logsList = existing ? JSON.parse(existing) : [];
    logsList.unshift(newLog);
    // Limitar a los últimos 500 registros
    localStorage.setItem(localKey, JSON.stringify(logsList.slice(0, 500)));
  } catch (e) {
    console.error("Error al escribir log en localStorage:", e);
  }
}
