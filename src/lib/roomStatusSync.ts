// Sincronización entre Gestión de Tareas y Sistema de Reservas / Habitaciones
import { supabase } from "./supabase";

export interface RoomItem {
  id: number;
  name: string;
  code: string;
  type: string;
  capacity: number;
  priceUSD: number;
  status: "disponible" | "ocupada" | "reservada" | "mantenimiento";
  guest?: string;
  checkIn?: string;
  checkOut?: string;
  amenities: string[];
  cleaningStatus: "limpia" | "en_limpieza" | "sucia_post_checkout" | "mantenimiento";
  lastCleanedAt?: string;
}

export const DEFAULT_ROOMS: RoomItem[] = [
  {
    id: 1,
    name: "Suite Presidencial Vista al Mar",
    code: "HAB-301",
    type: "Suite Deluxe",
    capacity: 4,
    priceUSD: 160,
    status: "disponible",
    amenities: ["Jacuzzi Privado", "Cama King", "Balcón", "A/C Inverter", "Wifi Starlink"],
    cleaningStatus: "limpia"
  },
  {
    id: 2,
    name: "Habitación Matrimonial Superior",
    code: "HAB-202",
    type: "Matrimonial",
    capacity: 2,
    priceUSD: 85,
    status: "ocupada",
    guest: "Carlos Mendoza",
    checkOut: "Mañana 12:00 PM",
    amenities: ["Cama Queen", "A/C", "TV Smart", "Desayuno Incluido"],
    cleaningStatus: "en_limpieza"
  },
  {
    id: 3,
    name: "Villa Familiar 2 Ambientes",
    code: "VIL-104",
    type: "Villa",
    capacity: 6,
    priceUSD: 210,
    status: "reservada",
    guest: "Familia Gómez",
    checkIn: "Hoy 3:00 PM",
    amenities: ["Cocina Equipada", "2 Baños", "Terraza", "Piscina Compartida"],
    cleaningStatus: "limpia"
  },
  {
    id: 4,
    name: "Domo Glamping Panorámico",
    code: "GLAMP-01",
    type: "Glamping Eco",
    capacity: 2,
    priceUSD: 120,
    status: "disponible",
    amenities: ["Cama King", "Deck Privado", "Fogata", "Telescopio"],
    cleaningStatus: "limpia"
  }
];

// Obtener la lista de habitaciones de un establecimiento
export function getRoomsForEstablishment(establishmentId: number): RoomItem[] {
  const key = `hdv_rooms_${establishmentId}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn("Error al leer habitaciones locales:", e);
    }
  }
  localStorage.setItem(key, JSON.stringify(DEFAULT_ROOMS));
  return DEFAULT_ROOMS;
}

// Guardar lista de habitaciones
export function saveRoomsForEstablishment(establishmentId: number, rooms: RoomItem[]) {
  const key = `hdv_rooms_${establishmentId}`;
  localStorage.setItem(key, JSON.stringify(rooms));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("hdv_room_status_changed", { detail: { establishmentId, rooms } }));
  }
}

// Actualizar el estado de limpieza de una habitación en específico
export function updateRoomCleaningStatus(
  establishmentId: number,
  roomCode: string,
  newCleaningStatus: "limpia" | "en_limpieza" | "sucia_post_checkout" | "mantenimiento",
  newGeneralStatus?: "disponible" | "ocupada" | "reservada" | "mantenimiento"
) {
  const rooms = getRoomsForEstablishment(establishmentId);
  const updated = rooms.map(r => {
    if (r.code === roomCode || r.name.toLowerCase().includes(roomCode.toLowerCase())) {
      return {
        ...r,
        cleaningStatus: newCleaningStatus,
        status: newGeneralStatus ? newGeneralStatus : (newCleaningStatus === "mantenimiento" ? "mantenimiento" : r.status),
        lastCleanedAt: newCleaningStatus === "limpia" ? new Date().toISOString() : r.lastCleanedAt
      };
    }
    return r;
  });
  saveRoomsForEstablishment(establishmentId, updated);
}

// Solicitar limpieza de una habitación (crea una tarea en TaskModule automáticamente)
export async function requestRoomHousekeeping(
  establishmentId: number,
  roomCode: string,
  roomName: string,
  assignedStaff: string = "Camarera de Turno",
  reason: string = "Limpieza de rutina y preparación de sábanas"
) {
  // 1. Marcar habitación en proceso de limpieza
  updateRoomCleaningStatus(establishmentId, roomCode, "en_limpieza");

  // 2. Insertar tarea en TaskModule
  const taskKey = `hdv_tasks_${establishmentId}`;
  const rawTasks = localStorage.getItem(taskKey);
  let tasksList: any[] = rawTasks ? JSON.parse(rawTasks) : [];

  const newTask = {
    id: crypto.randomUUID(),
    establishment_id: establishmentId,
    room_code: roomCode,
    category: "Limpieza",
    title: `Limpieza y sanitización ${roomCode}`,
    description: `${reason} (${roomName})`,
    priority: "high",
    status: "in_progress",
    assigned_to: assignedStaff,
    created_at: new Date().toISOString()
  };

  tasksList = [newTask, ...tasksList];
  localStorage.setItem(taskKey, JSON.stringify(tasksList));

  // Intentar sincronizar con Supabase
  try {
    await supabase.from("hotel_tasks").insert([newTask]);
  } catch (err) {
    console.warn("Sincronización Supabase tarea guardada localmente:", err);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("hdv_tasks_changed", { detail: { establishmentId } }));
  }

  return newTask;
}
