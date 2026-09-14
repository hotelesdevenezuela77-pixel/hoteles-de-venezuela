import { supabase } from "./supabase";

export interface HotelSpace {
  id: string;
  establishment_id: number;
  code: string;
  name: string;
  type: "room" | "glamping" | "villa" | "common_area" | "facility";
  building_floor: string;
  occupancy_status: "vacant" | "occupied" | "reserved" | "out_of_order";
  cleaning_status: "dirty" | "in_progress" | "clean" | "inspected" | "out_of_service";
  maintenance_status: "operational" | "minor_issue" | "critical_lock";
  metadata?: Record<string, any>;
}

export interface CustomFieldDefinition {
  id: string;
  establishment_id: number;
  target_entity: "task" | "space" | "maintenance_ticket" | "inspection";
  field_name: string;
  field_key: string;
  field_type: "text" | "number" | "select" | "boolean" | "photo" | "signature" | "date" | "currency" | "formula";
  options?: string[];
  is_required: boolean;
}

export interface OperationalTask {
  id: string;
  establishment_id: number;
  space_id?: string;
  space_code?: string;
  reservation_id?: string;
  category: "housekeeping" | "maintenance" | "inspection" | "minibar" | "amenities";
  task_type: "turnover_clean" | "stayover_clean" | "deep_clean" | "preventive_maint" | "urgent_repair";
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical_blocking";
  status: "pending" | "in_progress" | "inspected" | "completed" | "cancelled";
  assigned_to_user_id?: string;
  assigned_staff_name: string;
  estimated_minutes: number;
  checklist_responses?: Record<string, boolean | string>;
  custom_values?: Record<string, any>;
  photo_urls?: string[];
  digital_signature_url?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface MaintenanceTicket {
  id: string;
  establishment_id: number;
  space_code: string;
  equipment_name?: string;
  severity: "minor" | "moderate" | "high" | "blocking_out_of_order";
  issue_type: string;
  status: "open" | "diagnosing" | "waiting_parts" | "resolved" | "closed";
  blocks_inventory: boolean;
  reported_by: string;
  technician_assigned: string;
  repair_cost_usd: number;
  attachments?: string[];
  created_at: string;
}

// DATOS INICIALES DE EJEMPLO PARA INSTALACIONES
export const DEFAULT_HOTEL_SPACES: HotelSpace[] = [
  {
    id: "sp-1",
    establishment_id: 101,
    code: "HAB-301",
    name: "Suite Presidencial Vista al Mar",
    type: "room",
    building_floor: "Piso 3 · Torre A",
    occupancy_status: "vacant",
    cleaning_status: "clean",
    maintenance_status: "operational"
  },
  {
    id: "sp-2",
    establishment_id: 101,
    code: "HAB-202",
    name: "Habitación Matrimonial Superior",
    type: "room",
    building_floor: "Piso 2 · Torre A",
    occupancy_status: "occupied",
    cleaning_status: "in_progress",
    maintenance_status: "operational"
  },
  {
    id: "sp-3",
    establishment_id: 101,
    code: "VIL-104",
    name: "Villa Familiar 2 Ambientes",
    type: "villa",
    building_floor: "Planta Baja · Zona Jardines",
    occupancy_status: "reserved",
    cleaning_status: "clean",
    maintenance_status: "operational"
  },
  {
    id: "sp-4",
    establishment_id: 101,
    code: "GLAMP-01",
    name: "Domo Glamping Panorámico",
    type: "glamping",
    building_floor: "Zona Colina VIP",
    occupancy_status: "vacant",
    cleaning_status: "dirty",
    maintenance_status: "operational"
  },
  {
    id: "sp-5",
    establishment_id: 101,
    code: "FAC-PISCINA",
    name: "Piscina Principal & Jacuzzi",
    type: "common_area",
    building_floor: "Nivel Terraza",
    occupancy_status: "vacant",
    cleaning_status: "clean",
    maintenance_status: "operational"
  }
];

// OBTENER ESPACIOS
export function getHotelSpaces(establishmentId: number): HotelSpace[] {
  const key = `hdv_ops_spaces_${establishmentId}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {}
  }
  const filtered = DEFAULT_HOTEL_SPACES.map(s => ({ ...s, establishment_id: establishmentId }));
  localStorage.setItem(key, JSON.stringify(filtered));
  return filtered;
}

// GUARDAR ESPACIOS
export function saveHotelSpaces(establishmentId: number, spaces: HotelSpace[]) {
  const key = `hdv_ops_spaces_${establishmentId}`;
  localStorage.setItem(key, JSON.stringify(spaces));
  broadcastOpsEvent(establishmentId);
}

// OBTENER TAREAS OPERATIVAS
export function getOperationalTasks(establishmentId: number): OperationalTask[] {
  const key = `hdv_ops_tasks_${establishmentId}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {}
  }
  const defaults: OperationalTask[] = [
    {
      id: "tsk-101",
      establishment_id: establishmentId,
      space_code: "HAB-301",
      category: "housekeeping",
      task_type: "turnover_clean",
      title: "Limpieza Profunda y Sanitización Suite Presidencial",
      description: "Cambio total de sábanas, desinfección de Jacuzzi y reposición de batas VIP.",
      priority: "high",
      status: "pending",
      assigned_staff_name: "María Delgado (Camarera)",
      estimated_minutes: 45,
      created_at: new Date().toISOString()
    },
    {
      id: "tsk-102",
      establishment_id: establishmentId,
      space_code: "HAB-202",
      category: "maintenance",
      task_type: "urgent_repair",
      title: "Mantenimiento Técnico A/C Inverter",
      description: "Limpieza de filtros y verificación de carga de gas refrigerante.",
      priority: "medium",
      status: "in_progress",
      assigned_staff_name: "Carlos Pérez (Técnico HVAC)",
      estimated_minutes: 30,
      created_at: new Date(Date.now() - 3600000).toISOString()
    }
  ];
  localStorage.setItem(key, JSON.stringify(defaults));
  return defaults;
}

// OBTENER TICKETS DE MANTENIMIENTO
export function getMaintenanceTickets(establishmentId: number): MaintenanceTicket[] {
  const key = `hdv_ops_tickets_${establishmentId}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {}
  }
  return [];
}

// OBTENER DEFINICIONES DE CAMPOS DINÁMICOS (CUSTOM FIELDS)
export function getCustomFieldDefinitions(establishmentId: number): CustomFieldDefinition[] {
  const key = `hdv_ops_fields_${establishmentId}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {}
  }
  const defaultFields: CustomFieldDefinition[] = [
    {
      id: "cf-1",
      establishment_id: establishmentId,
      target_entity: "task",
      field_name: "Foto Obligatoria del Baño Sanitizado",
      field_key: "foto_bano",
      field_type: "photo",
      is_required: true
    },
    {
      id: "cf-2",
      establishment_id: establishmentId,
      target_entity: "task",
      field_name: "Firma Digital de Camarera / Técnico",
      field_key: "firma_digital",
      field_type: "signature",
      is_required: false
    },
    {
      id: "cf-3",
      establishment_id: establishmentId,
      target_entity: "task",
      field_name: "Estado de Minibar Reabastecido",
      field_key: "minibar_ok",
      field_type: "boolean",
      is_required: false
    }
  ];
  localStorage.setItem(key, JSON.stringify(defaultFields));
  return defaultFields;
}

// GUARDAR DEFINICIÓN DE CAMPO PERSONALIZADO
export function saveCustomFieldDefinition(establishmentId: number, fieldDef: CustomFieldDefinition) {
  const list = getCustomFieldDefinitions(establishmentId);
  const updated = [fieldDef, ...list.filter(f => f.id !== fieldDef.id)];
  localStorage.setItem(`hdv_ops_fields_${establishmentId}`, JSON.stringify(updated));
  broadcastOpsEvent(establishmentId);
}

// MATRIZ DE DISPARADORES DE EVENTOS DEL PMS (EVENT-DRIVEN AUTOMATION)
export function triggerPMSEvent(
  establishmentId: number,
  eventType: "CHECK_OUT" | "CHECK_IN" | "STAY_OVER" | "CRITICAL_INCIDENT" | "SUPERVISOR_INSPECT",
  roomCode: string,
  extraDetails?: { guestName?: string; issueDescription?: string; assignedStaff?: string }
) {
  const spaces = getHotelSpaces(establishmentId);
  const tasks = getOperationalTasks(establishmentId);
  const tickets = getMaintenanceTickets(establishmentId);

  const space = spaces.find(s => s.code === roomCode);
  if (!space) return;

  if (eventType === "CHECK_OUT") {
    // 1. Habitación pasa a Sucia
    space.cleaning_status = "dirty";
    space.occupancy_status = "vacant";

    // 2. Generar tarea de Limpieza Profunda de Salida
    const newTask: OperationalTask = {
      id: crypto.randomUUID(),
      establishment_id: establishmentId,
      space_id: space.id,
      space_code: roomCode,
      category: "housekeeping",
      task_type: "turnover_clean",
      title: `Limpieza de Salida (Check-out) ${roomCode}`,
      description: `Huésped ${extraDetails?.guestName || "Anterior"} ha realizado Check-out. Preparar para próximo ingreso.`,
      priority: "high",
      status: "pending",
      assigned_staff_name: extraDetails?.assignedStaff || "Camarera de Turno",
      estimated_minutes: 40,
      created_at: new Date().toISOString()
    };
    tasks.unshift(newTask);
  } 
  else if (eventType === "CRITICAL_INCIDENT") {
    // 1. Habitación o espacio pasa a Fuera de Servicio (Out of Order)
    space.maintenance_status = "critical_lock";
    space.cleaning_status = "out_of_service";
    space.occupancy_status = "out_of_order";

    // 2. Crear Ticket de Mantenimiento Bloqueante
    const newTicket: MaintenanceTicket = {
      id: crypto.randomUUID(),
      establishment_id: establishmentId,
      space_code: roomCode,
      equipment_name: extraDetails?.issueDescription || "Instalaciones de la Habitación",
      severity: "blocking_out_of_order",
      issue_type: "Falla Crítica Reportada",
      status: "open",
      blocks_inventory: true,
      reported_by: "Sistema Automático PMS / Recepción",
      technician_assigned: extraDetails?.assignedStaff || "Técnico de Guardia",
      repair_cost_usd: 0,
      created_at: new Date().toISOString()
    };
    tickets.unshift(newTicket);
  }
  else if (eventType === "SUPERVISOR_INSPECT") {
    space.cleaning_status = "inspected";
    space.occupancy_status = "vacant";
  }

  saveHotelSpaces(establishmentId, spaces);
  localStorage.setItem(`hdv_ops_tasks_${establishmentId}`, JSON.stringify(tasks));
  localStorage.setItem(`hdv_ops_tickets_${establishmentId}`, JSON.stringify(tickets));
  broadcastOpsEvent(establishmentId);
}

// EMITIR EVENTO RECTIVO
export function broadcastOpsEvent(establishmentId: number) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("hdv_ops_updated", { detail: { establishmentId } }));
  }
}
