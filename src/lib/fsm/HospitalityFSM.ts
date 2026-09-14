/**
 * =============================================================================
 * DETERMINISTIC FINITE STATE MACHINE (FSM) & PRECEDENCE ENGINE V2
 * Hoteles de Venezuela SaaS Enterprise Operations Engine
 * =============================================================================
 */

export enum RoomOccupancyStatus {
  VACANT = "vacant",
  OCCUPIED = "occupied",
  RESERVED = "reserved",
  OUT_OF_ORDER = "out_of_order"
}

export enum CleaningStatus {
  DIRTY = "dirty",
  IN_PROGRESS = "in_progress",
  TOUCH_UP_REQUIRED = "touch_up_required",
  CLEAN = "clean",
  INSPECTED = "inspected",
  OUT_OF_SERVICE = "out_of_service"
}

export enum MaintenanceStatus {
  OPERATIONAL = "operational",
  MINOR_ISSUE = "minor_issue",
  CRITICAL_LOCK = "critical_lock"
}

export enum OperationalEvent {
  CHECK_OUT = "CHECK_OUT",
  CHECK_IN = "CHECK_IN",
  START_CLEANING = "START_CLEANING",
  COMPLETE_CLEANING = "COMPLETE_CLEANING",
  SUPERVISOR_APPROVE = "SUPERVISOR_APPROVE",
  REPORT_CRITICAL_ISSUE = "REPORT_CRITICAL_ISSUE",
  RESOLVE_MAINTENANCE = "RESOLVE_MAINTENANCE",
  DEAD_MAN_TIMER_EXPIRED = "DEAD_MAN_TIMER_EXPIRED"
}

export interface RoomState {
  occupancy: RoomOccupancyStatus;
  cleaning: CleaningStatus;
  maintenance: MaintenanceStatus;
  lastCleanedAt: string | null;
  lastInspectedAt: string | null;
}

export interface TransitionPayload {
  spaceId: string;
  spaceCode: string;
  actorId?: string;
  actorName: string;
  reason?: string;
  timestamp?: string;
}

export interface TransitionResult {
  success: boolean;
  previousState: RoomState;
  newState: RoomState;
  event: OperationalEvent;
  generatedTask?: {
    category: string;
    title: string;
    description: string;
    priority: "low" | "medium" | "high" | "critical_blocking";
    estimatedMinutes: number;
  };
  error?: string;
}

/**
 * Precedence Rule Weights: Safety & Maintenance strictly supersede readiness.
 * Out of Order (6) > Out of Service (5) > Dirty (4) > In Progress (3) > Touch-Up (2) > Clean (1) > Inspected (0)
 */
export const STATUS_PRECEDENCE_WEIGHTS: Record<CleaningStatus, number> = {
  [CleaningStatus.OUT_OF_SERVICE]: 5,
  [CleaningStatus.DIRTY]: 4,
  [CleaningStatus.IN_PROGRESS]: 3,
  [CleaningStatus.TOUCH_UP_REQUIRED]: 2,
  [CleaningStatus.CLEAN]: 1,
  [CleaningStatus.INSPECTED]: 0
};

/**
 * Dead Man's Switch Stagnation Threshold (5 Days in milliseconds)
 */
export const DEAD_MAN_STAGNATION_MS = 5 * 24 * 60 * 60 * 1000;

export class HospitalityFSM {
  
  /**
   * Deterministic State Transition Execution Engine
   */
  public static transitionRoomState(
    currentState: RoomState,
    event: OperationalEvent,
    payload: TransitionPayload
  ): TransitionResult {
    const timestamp = payload.timestamp || new Date().toISOString();

    // 1. Safety Guard: Critical Lock prevents transition to Clean or Inspected
    if (
      currentState.maintenance === MaintenanceStatus.CRITICAL_LOCK &&
      event !== OperationalEvent.RESOLVE_MAINTENANCE
    ) {
      return {
        success: false,
        previousState: currentState,
        newState: currentState,
        event,
        error: `Illegal Transition: Room ${payload.spaceCode} is locked under Out-of-Order maintenance (CRITICAL_LOCK). Resolve maintenance first.`
      };
    }

    let newState: RoomState = { ...currentState };
    let generatedTask: TransitionResult["generatedTask"] = undefined;

    switch (event) {
      case OperationalEvent.CHECK_OUT:
        newState.occupancy = RoomOccupancyStatus.VACANT;
        newState.cleaning = CleaningStatus.DIRTY;
        generatedTask = {
          category: "housekeeping",
          title: `Limpieza de Salida (Check-out) ${payload.spaceCode}`,
          description: `Check-out registrado para ${payload.spaceCode}. Iniciar desinfección profunda.`,
          priority: "high",
          estimatedMinutes: 40
        };
        break;

      case OperationalEvent.START_CLEANING:
        if (currentState.cleaning !== CleaningStatus.DIRTY && currentState.cleaning !== CleaningStatus.TOUCH_UP_REQUIRED) {
          return {
            success: false,
            previousState: currentState,
            newState: currentState,
            event,
            error: `Illegal Transition: Cannot start cleaning room in state '${currentState.cleaning}'.`
          };
        }
        newState.cleaning = CleaningStatus.IN_PROGRESS;
        break;

      case OperationalEvent.COMPLETE_CLEANING:
        newState.cleaning = CleaningStatus.CLEAN;
        newState.lastCleanedAt = timestamp;
        generatedTask = {
          category: "inspection",
          title: `Inspección de Ama de Llaves ${payload.spaceCode}`,
          description: `Camarera ${payload.actorName} ha completado la limpieza. Verificar estándares de calidad.`,
          priority: "medium",
          estimatedMinutes: 15
        };
        break;

      case OperationalEvent.SUPERVISOR_APPROVE:
        if (currentState.cleaning !== CleaningStatus.CLEAN) {
          return {
            success: false,
            previousState: currentState,
            newState: currentState,
            event,
            error: `Illegal Transition: Supervisor cannot approve inspection until room is cleaned.`
          };
        }
        newState.cleaning = CleaningStatus.INSPECTED;
        newState.occupancy = RoomOccupancyStatus.VACANT;
        newState.lastInspectedAt = timestamp;
        break;

      case OperationalEvent.CHECK_IN:
        if (currentState.cleaning !== CleaningStatus.INSPECTED && currentState.cleaning !== CleaningStatus.CLEAN) {
          return {
            success: false,
            previousState: currentState,
            newState: currentState,
            event,
            error: `Illegal Transition: Check-in rejected. Room ${payload.spaceCode} is not inspected/clean.`
          };
        }
        newState.occupancy = RoomOccupancyStatus.OCCUPIED;
        break;

      case OperationalEvent.REPORT_CRITICAL_ISSUE:
        newState.maintenance = MaintenanceStatus.CRITICAL_LOCK;
        newState.cleaning = CleaningStatus.OUT_OF_SERVICE;
        newState.occupancy = RoomOccupancyStatus.OUT_OF_ORDER;
        generatedTask = {
          category: "maintenance",
          title: `Urgencia Técnica Bloqueante ${payload.spaceCode}`,
          description: payload.reason || "Falla técnica crítica reportada. Inhabilitado en inventario de ventas.",
          priority: "critical_blocking",
          estimatedMinutes: 60
        };
        break;

      case OperationalEvent.RESOLVE_MAINTENANCE:
        newState.maintenance = MaintenanceStatus.OPERATIONAL;
        newState.cleaning = CleaningStatus.DIRTY;
        newState.occupancy = RoomOccupancyStatus.VACANT;
        generatedTask = {
          category: "housekeeping",
          title: `Limpieza Post-Mantenimiento ${payload.spaceCode}`,
          description: `Mantenimiento resuelto por ${payload.actorName}. Realizar limpieza post-reparación.`,
          priority: "high",
          estimatedMinutes: 30
        };
        break;

      case OperationalEvent.DEAD_MAN_TIMER_EXPIRED:
        if (currentState.occupancy === RoomOccupancyStatus.VACANT && currentState.cleaning === CleaningStatus.INSPECTED) {
          newState.cleaning = CleaningStatus.TOUCH_UP_REQUIRED;
          generatedTask = {
            category: "housekeeping",
            title: `Retoque por Inactividad (5 días) ${payload.spaceCode}`,
            description: `Habitación inactiva por más de 5 días. Realizar retoque rápido de 15 min.`,
            priority: "low",
            estimatedMinutes: 15
          };
        }
        break;

      default:
        return {
          success: false,
          previousState: currentState,
          newState: currentState,
          event,
          error: `Unsupported Operational Event: '${event}'.`
        };
    }

    return {
      success: true,
      previousState: currentState,
      newState,
      event,
      generatedTask
    };
  }

  /**
   * Dead Man's Switch Evaluation: Detects rooms vacant/clean > 5 days and triggers touch-up
   */
  public static evaluateDeadMansSwitch(roomState: RoomState, spaceCode: string): TransitionResult | null {
    if (
      roomState.occupancy === RoomOccupancyStatus.VACANT &&
      (roomState.cleaning === CleaningStatus.INSPECTED || roomState.cleaning === CleaningStatus.CLEAN)
    ) {
      const referenceTime = roomState.lastInspectedAt || roomState.lastCleanedAt;
      if (referenceTime) {
        const elapsedMs = Date.now() - new Date(referenceTime).getTime();
        if (elapsedMs >= DEAD_MAN_STAGNATION_MS) {
          return this.transitionRoomState(roomState, OperationalEvent.DEAD_MAN_TIMER_EXPIRED, {
            spaceId: "",
            spaceCode,
            actorName: "DEAD_MAN_SWITCH_DAEMON",
            reason: "Habitación inactiva por más de 5 días sin ocupar."
          });
        }
      }
    }
    return null;
  }
}
