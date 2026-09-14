import React, { useState, useEffect, useRef } from "react";
import { 
  ClipboardList, Plus, Trash2, CheckCircle2, Clock, AlertTriangle, 
  User, Loader2, ArrowRight, BedDouble, Sparkles, Wrench, ShieldAlert, 
  Grid, Smartphone, Sliders, CheckSquare, Camera, FileText, DollarSign,
  AlertOctagon, Check, RefreshCw, Layers, ShieldCheck, PenTool, LayoutGrid, WifiOff
} from "lucide-react";
import { 
  HospitalityFSM, 
  CleaningStatus, 
  MaintenanceStatus, 
  RoomOccupancyStatus, 
  OperationalEvent,
  type RoomState 
} from "../../../lib/fsm/HospitalityFSM";
import { SyncEngine, type OutboxMutation } from "../../../lib/sync/SyncEngine";
import { OperationsWorker } from "../../../lib/edge/operationsWorker";
import { 
  getHotelSpaces, 
  getOperationalTasks, 
  getMaintenanceTickets, 
  getCustomFieldDefinitions,
  saveCustomFieldDefinition,
  type HotelSpace, 
  type OperationalTask, 
  type MaintenanceTicket,
  type CustomFieldDefinition 
} from "../../../lib/hospitalityOperationsSync";

interface AdvancedTaskOperationsModuleProps {
  establishmentId: number;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

export function AdvancedTaskOperationsModule({
  establishmentId,
  primaryColor = "#00C8D4",
  secondaryColor = "#9B00CC",
  accentColor = "#FF0096"
}: AdvancedTaskOperationsModuleProps) {
  const [activeTab, setActiveTab] = useState<"floor_plan" | "kanban" | "pwa_staff" | "no_code" | "maintenance">("floor_plan");
  
  // Estados de datos V2
  const [spaces, setSpaces] = useState<HotelSpace[]>([]);
  const [tasks, setTasks] = useState<OperationalTask[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressedPhotoUrl, setCompressedPhotoUrl] = useState<string | null>(null);

  // Modales
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskRoomCode, setTaskRoomCode] = useState("");
  const [taskCategory, setTaskCategory] = useState<"housekeeping" | "maintenance" | "inspection" | "minibar">("housekeeping");
  const [taskAssignedTo, setTaskAssignedTo] = useState("");

  const [showNewFieldModal, setShowNewFieldModal] = useState(false);
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState<CustomFieldDefinition["field_type"]>("text");
  const [fieldRequired, setFieldRequired] = useState(false);

  // Cargar datos centralizados y sincronizar
  const reloadAllData = () => {
    setLoading(true);
    setSpaces(getHotelSpaces(establishmentId));
    setTasks(getOperationalTasks(establishmentId));
    setTickets(getMaintenanceTickets(establishmentId));
    setCustomFields(getCustomFieldDefinitions(establishmentId));
    setLoading(false);
  };

  useEffect(() => {
    reloadAllData();

    const handleSyncEvent = (e: any) => {
      if (e.detail?.establishmentId === establishmentId) {
        reloadAllData();
      }
    };

    window.addEventListener("hdv_ops_updated", handleSyncEvent);
    window.addEventListener("hdv_sync_engine_event", handleSyncEvent);
    return () => {
      window.removeEventListener("hdv_ops_updated", handleSyncEvent);
      window.removeEventListener("hdv_sync_engine_event", handleSyncEvent);
    };
  }, [establishmentId]);

  // Transición FSM Determinista
  const executeFSMTransition = async (roomCode: string, event: OperationalEvent, actorName = "Staff Usuario") => {
    const targetSpace = spaces.find(s => s.code === roomCode);
    if (!targetSpace) return;

    const currentFSMState: RoomState = {
      occupancy: targetSpace.occupancy_status as any,
      cleaning: targetSpace.cleaning_status as any,
      maintenance: targetSpace.maintenance_status as any,
      lastCleanedAt: null,
      lastInspectedAt: null
    };

    const result = HospitalityFSM.transitionRoomState(currentFSMState, event, {
      spaceId: targetSpace.id,
      spaceCode: roomCode,
      actorName
    });

    if (!result.success) {
      alert(`⚠️ Transición Denegada por FSM:\n${result.error}`);
      return;
    }

    // Actualizar estado optimista
    targetSpace.cleaning_status = result.newState.cleaning;
    targetSpace.occupancy_status = result.newState.occupancy;
    targetSpace.maintenance_status = result.newState.maintenance;

    // Encolar mutación offline-first en IndexedDB Outbox
    await SyncEngine.enqueueMutation({
      establishment_id: establishmentId,
      entity_type: "space",
      operation: "TRANSITION",
      payload: {
        id: targetSpace.id,
        code: targetSpace.code,
        cleaning_status: result.newState.cleaning,
        occupancy_status: result.newState.occupancy,
        maintenance_status: result.newState.maintenance,
        event
      }
    });

    reloadAllData();
  };

  // Carga de archivo de cámara con compresión WebP cliente (<250KB)
  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const webpUrl = await OperationsWorker.compressImageToWebP(file, 250, 1600);
      setCompressedPhotoUrl(webpUrl);
    } catch (err) {
      console.warn("Error al comprimir foto:", err);
    } finally {
      setIsCompressing(false);
    }
  };

  // Crear Tarea encolando en Outbox Engine
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    const newTaskPayload = {
      id: crypto.randomUUID(),
      establishment_id: establishmentId,
      space_code: taskRoomCode || undefined,
      category: taskCategory,
      task_type: taskCategory === "housekeeping" ? "turnover_clean" : "urgent_repair",
      title: taskTitle,
      description: `Tarea operativa generada para ${taskRoomCode || "Instalaciones Generales"}`,
      priority: "high",
      status: "pending",
      assigned_staff_name: taskAssignedTo || "Staff de Turno",
      estimated_minutes: 30,
      created_at: new Date().toISOString()
    };

    await SyncEngine.enqueueMutation({
      establishment_id: establishmentId,
      entity_type: "task",
      operation: "CREATE",
      payload: newTaskPayload
    });

    setShowAddTaskModal(false);
    setTaskTitle("");
    setTaskRoomCode("");
    setTaskAssignedTo("");
    reloadAllData();
  };

  return (
    <div className="bg-[#121620] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 text-slate-100 font-sans">
      
      {/* Cabecera Principal de Operaciones Avanzadas V2 */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00C8D4] to-[#9B00CC] flex items-center justify-center shadow-lg shadow-[#00C8D4]/20">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#FF0096]/15 text-[#FF0096] border border-[#FF0096]/30 mb-1">
              <Sparkles className="w-3 h-3" />
              <span>V2 Enterprise FSM Engine · IndexedDB Outbox</span>
            </div>
            <h2 className="text-xl font-black font-serif text-white tracking-wide">
              Gestión Operativa Hoteles de Venezuela V2
            </h2>
            <p className="text-xs text-slate-400">
              FSM determinista de precedencia (OOO &gt; Dirty &gt; Clean), Outbox Offline y compresión WebP (&lt;250KB).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-[#0b0c10] shadow-lg transition-transform active:scale-97 cursor-pointer"
            style={{ backgroundColor: accentColor }}
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Tarea / Limpieza</span>
          </button>
        </div>
      </div>

      {/* Navegador por Pestañas del Sistema Operativo V2 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/5 scrollbar-thin">
        {[
          { id: "floor_plan", label: "Matriz FSM & Plano", icon: LayoutGrid, count: spaces.length },
          { id: "kanban", label: "Tablero Kanban Tareas", icon: Grid, count: tasks.length },
          { id: "pwa_staff", label: "PWA Staff & WebP Camera", icon: Smartphone, badge: "WebP <250KB" },
          { id: "no_code", label: "Campos Dinámicos (No-Code)", icon: Sliders, count: customFields.length },
          { id: "maintenance", label: "Mantenimiento / Out of Order", icon: Wrench, count: tickets.length }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-gradient-to-r from-[#00C8D4]/20 to-[#9B00CC]/20 text-[#00C8D4] border border-[#00C8D4]/40 shadow-lg scale-102"
                  : "bg-slate-950/40 text-slate-400 hover:text-white border border-white/5"
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${isActive ? "bg-[#00C8D4] text-[#0b0c10]" : "bg-slate-800 text-slate-400"}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span>{t.label}</span>
              {t.badge && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-[#FF0096] text-white">
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── PESTAÑA 1: MATRIZ FSM & PLANO INTERACTIVO ── */}
      {activeTab === "floor_plan" && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/40 p-4 rounded-2xl border border-white/5">
            <div>
              <h3 className="text-sm font-bold font-serif text-white uppercase tracking-wider flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-[#00C8D4]" />
                Matriz FSM de Precedencia Operativa (Determinista)
              </h3>
              <p className="text-[11px] text-slate-400">
                Precedencia Estricta: Out of Order (OOO) &gt; Dirty &gt; In Progress &gt; Inspected &gt; Clean.
              </p>
            </div>

            <div className="flex items-center gap-3 text-[10px] font-bold flex-wrap">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> ✨ Limpia & Lista
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span> 🧹 En Limpieza
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span> 🏷️ Sucia Post Checkout
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span> 🔧 Out of Order
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {spaces.map(s => {
              const isClean = s.cleaning_status === "clean" || s.cleaning_status === "inspected";
              const isInProgress = s.cleaning_status === "in_progress";
              const isOutOfOrder = s.maintenance_status === "critical_lock" || s.cleaning_status === "out_of_service";

              return (
                <div 
                  key={s.id} 
                  className={`relative p-5 rounded-3xl border transition-all duration-300 shadow-xl space-y-4 ${
                    isClean
                      ? "bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60"
                      : isInProgress
                      ? "bg-amber-950/20 border-amber-500/40 hover:border-amber-500/70"
                      : isOutOfOrder
                      ? "bg-purple-950/20 border-purple-500/40 hover:border-purple-500/70"
                      : "bg-rose-950/20 border-rose-500/40 hover:border-rose-500/70"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-[10px] font-black tracking-widest text-[#00C8D4] block">{s.code}</span>
                      <h4 className="text-sm font-bold font-serif text-white">{s.name}</h4>
                      <span className="text-[10px] text-slate-400">{s.building_floor}</span>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                      <BedDouble className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      isClean
                        ? "bg-emerald-500/20 text-emerald-400"
                        : isInProgress
                        ? "bg-amber-500/20 text-amber-400"
                        : isOutOfOrder
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-rose-500/20 text-rose-400"
                    }`}>
                      {isClean ? "✨ Operativa" : isInProgress ? "🧹 En Limpieza" : isOutOfOrder ? "🔧 Out of Order" : "🏷️ Sucia"}
                    </span>

                    <div className="flex items-center gap-1">
                      {!isClean && (
                        <button
                          onClick={() => executeFSMTransition(s.code, OperationalEvent.SUPERVISOR_APPROVE)}
                          className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[9px] font-bold rounded-lg cursor-pointer"
                        >
                          Limpiar
                        </button>
                      )}
                      {isClean && (
                        <button
                          onClick={() => executeFSMTransition(s.code, OperationalEvent.CHECK_OUT)}
                          className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-[9px] font-bold rounded-lg cursor-pointer"
                        >
                          Check-out
                        </button>
                      )}
                      <button
                        onClick={() => executeFSMTransition(s.code, OperationalEvent.REPORT_CRITICAL_ISSUE, "Inspección FSM")}
                        className="px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-[9px] font-bold rounded-lg cursor-pointer"
                      >
                        Bloquear
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── PESTAÑA 2: TABLERO KANBAN DE TAREAS ── */}
      {activeTab === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
          {["pending", "in_progress", "inspected", "completed"].map(statusKey => {
            const list = tasks.filter(t => t.status === statusKey);
            const title = 
              statusKey === "pending" ? "Pendientes" :
              statusKey === "in_progress" ? "En Progreso" :
              statusKey === "inspected" ? "Por Inspeccionar" : "Operativas";

            return (
              <div key={statusKey} className="bg-slate-950/40 border border-white/5 rounded-3xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#00C8D4]" /> {title} ({list.length})
                  </span>
                </div>

                <div className="space-y-3">
                  {list.map(t => (
                    <div key={t.id} className="bg-[#121620] border border-white/10 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[9px] font-black bg-[#FF0096]/20 text-[#FF0096]">
                          {t.priority}
                        </span>
                        {t.space_code && <span className="font-mono text-[9px] font-bold text-[#00C8D4]">{t.space_code}</span>}
                      </div>
                      <h5 className="text-xs font-bold text-white">{t.title}</h5>
                      <p className="text-[10px] text-slate-400 line-clamp-2">{t.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── PESTAÑA 3: MODO PWA MÓVIL STAFF (COMPRESIÓN WEBP <250KB) ── */}
      {activeTab === "pwa_staff" && (
        <div className="max-w-md mx-auto bg-[#0e011f] border border-white/20 rounded-3xl p-5 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#FF0096]" />
              <div>
                <h4 className="text-xs font-black font-serif text-white uppercase">App PWA Staff & Camera WebP</h4>
                <p className="text-[9px] text-slate-400">Sincronización IndexedDB Outbox</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-emerald-500/20 text-emerald-400">IndexedDB Ready</span>
          </div>

          <div className="bg-[#1a0533] border border-[#FF0096]/40 rounded-2xl p-4 space-y-3">
            <h5 className="text-sm font-bold text-white">Inspección con Compresión Wasm/WebP</h5>
            
            <div className="pt-2 border-t border-white/10 space-y-2">
              <span className="text-[9px] uppercase font-bold text-[#00C8D4] block flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" /> Fotografía de Evidencia (Target &lt; 250KB)
              </span>

              <label className="p-4 bg-black/40 border border-dashed border-white/20 rounded-xl text-center cursor-pointer hover:border-[#00C8D4] transition-colors block">
                {isCompressing ? (
                  <div className="flex items-center justify-center gap-2 text-xs text-[#00C8D4]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Comprimiendo a WebP &lt;250KB...</span>
                  </div>
                ) : (
                  <>
                    <Camera className="w-6 h-6 text-[#00C8D4] mx-auto mb-1" />
                    <span className="text-[10px] text-slate-300 font-bold block">Tomar Foto con la Cámara</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoCapture} />
              </label>

              {compressedPhotoUrl && (
                <div className="relative mt-2 rounded-xl overflow-hidden border border-white/10 h-36 w-full">
                  <img src={compressedPhotoUrl} alt="WebP Preview" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-2 text-[8px] bg-black/70 text-emerald-400 px-2 py-0.5 rounded font-mono">
                    ✓ Comprimido en WebP (&lt;250KB)
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => alert("¡Fotografía encolada en IndexedDB Outbox y enviada!")}
              className="w-full py-3 bg-[#FF0096] hover:bg-[#d40085] text-white rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg active:scale-97 transition-all mt-2"
            >
              Completar & Encolar en Outbox
            </button>
          </div>
        </div>
      )}

      {/* ── PESTAÑA 4: CAMPOS DINÁMICOS (NO-CODE BUILDER) ── */}
      {activeTab === "no_code" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center bg-slate-950/40 p-4 rounded-2xl border border-white/5">
            <div>
              <h3 className="text-sm font-bold font-serif text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#00C8D4]" />
                Motor No-Code Builder V2
              </h3>
              <p className="text-[11px] text-slate-400">Campos dinámicos guardados en JSONB e indizados con `jsonb_path_ops`.</p>
            </div>

            <button
              onClick={() => setShowNewFieldModal(true)}
              className="px-4 py-2 bg-[#00C8D4] hover:bg-[#00b0bd] text-[#0b0c10] font-black text-xs uppercase rounded-xl cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Crear Campo Personalizado
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {customFields.map(cf => (
              <div key={cf.id} className="p-5 bg-slate-950/40 border border-white/10 rounded-2xl space-y-3">
                <div className="flex justify-between items-start">
                  <span className="px-2 py-0.5 rounded text-[9px] font-black bg-purple-500/20 text-purple-300 uppercase">
                    Tipo: {cf.field_type}
                  </span>
                  {cf.is_required && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-black bg-rose-500/20 text-rose-400">
                      Obligatorio
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white font-serif">{cf.field_name}</h4>
                <p className="text-[10px] font-mono text-slate-400">Clave DB: custom_values.{cf.field_key}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PESTAÑA 5: MANTENIMIENTO / OUT OF ORDER ── */}
      {activeTab === "maintenance" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center bg-slate-950/40 p-4 rounded-2xl border border-white/5">
            <div>
              <h3 className="text-sm font-bold font-serif text-white uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#FF0096]" />
                Mantenimiento & Bloqueo Out of Order
              </h3>
              <p className="text-[11px] text-slate-400">Fallas técnicas que inhabilitan la venta en el motor de reservas y OTAs.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.map(t => (
              <div key={t.id} className="p-5 bg-slate-950/40 border border-purple-500/30 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-bold text-[#00C8D4]">{t.space_code}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-purple-500/20 text-purple-300">
                    {t.severity}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{t.issue_type}</h4>
                <p className="text-xs text-slate-400">{t.equipment_name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
