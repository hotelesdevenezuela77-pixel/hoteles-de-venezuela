import React, { useState, useEffect } from "react";
import { 
  ClipboardList, Plus, Trash2, CheckCircle2, Clock, AlertTriangle, 
  User, Loader2, ArrowRight, BedDouble, Sparkles, Wrench, ShieldAlert, 
  Grid, Smartphone, Sliders, CheckSquare, Camera, FileText, DollarSign,
  AlertOctagon, Check, RefreshCw, Layers, ShieldCheck, PenTool, LayoutGrid
} from "lucide-react";
import { 
  getHotelSpaces, 
  getOperationalTasks, 
  getMaintenanceTickets, 
  getCustomFieldDefinitions,
  saveCustomFieldDefinition,
  triggerPMSEvent,
  saveHotelSpaces,
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
  
  // Estados de datos
  const [spaces, setSpaces] = useState<HotelSpace[]>([]);
  const [tasks, setTasks] = useState<OperationalTask[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal para nueva tarea
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskRoomCode, setTaskRoomCode] = useState("");
  const [taskCategory, setTaskCategory] = useState<"housekeeping" | "maintenance" | "inspection" | "minibar">("housekeeping");
  const [taskAssignedTo, setTaskAssignedTo] = useState("");

  // Modal para No-Code Custom Field Builder
  const [showNewFieldModal, setShowNewFieldModal] = useState(false);
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState<CustomFieldDefinition["field_type"]>("text");
  const [fieldRequired, setFieldRequired] = useState(false);

  // Cargar datos centralizados
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

    const handleUpdate = (e: any) => {
      if (e.detail?.establishmentId === establishmentId) {
        reloadAllData();
      }
    };

    window.addEventListener("hdv_ops_updated", handleUpdate);
    return () => {
      window.removeEventListener("hdv_ops_updated", handleUpdate);
    };
  }, [establishmentId]);

  // Cambiar estado de una tarea
  const handleUpdateTaskStatus = (taskId: string, newStatus: OperationalTask["status"]) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const updatedTask = { ...t, status: newStatus };
        // Si tiene habitación vinculada, sincronizar estado del espacio
        if (updatedTask.space_code) {
          if (newStatus === "completed") {
            triggerPMSEvent(establishmentId, "SUPERVISOR_INSPECT", updatedTask.space_code);
          } else if (newStatus === "in_progress") {
            const currentSpaces = getHotelSpaces(establishmentId);
            const targetSpace = currentSpaces.find(s => s.code === updatedTask.space_code);
            if (targetSpace) {
              targetSpace.cleaning_status = "in_progress";
              saveHotelSpaces(establishmentId, currentSpaces);
            }
          }
        }
        return updatedTask;
      }
      return t;
    });

    setTasks(updated);
    localStorage.setItem(`hdv_ops_tasks_${establishmentId}`, JSON.stringify(updated));
    reloadAllData();
  };

  // Guardar nueva tarea
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    const newTask: OperationalTask = {
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

    const updated = [newTask, ...tasks];
    setTasks(updated);
    localStorage.setItem(`hdv_ops_tasks_${establishmentId}`, JSON.stringify(updated));

    setShowAddTaskModal(false);
    setTaskTitle("");
    setTaskRoomCode("");
    setTaskAssignedTo("");
    reloadAllData();
  };

  // Guardar nuevo Custom Field (No-Code Builder)
  const handleCreateCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldName) return;

    const newField: CustomFieldDefinition = {
      id: crypto.randomUUID(),
      establishment_id: establishmentId,
      target_entity: "task",
      field_name: fieldName,
      field_key: fieldName.toLowerCase().replace(/\s+/g, "_"),
      field_type: fieldType,
      is_required: fieldRequired
    };

    saveCustomFieldDefinition(establishmentId, newField);
    setShowNewFieldModal(false);
    setFieldName("");
    setFieldType("text");
    setFieldRequired(false);
    reloadAllData();
  };

  return (
    <div className="bg-[#121620] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 text-slate-100 font-sans">
      
      {/* Cabecera Principal de Operaciones Avanzadas */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00C8D4] to-[#9B00CC] flex items-center justify-center shadow-lg shadow-[#00C8D4]/20">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#FF0096]/15 text-[#FF0096] border border-[#FF0096]/30 mb-1">
              <Sparkles className="w-3 h-3" />
              <span>PMS Operations Suite Pro</span>
            </div>
            <h2 className="text-xl font-black font-serif text-white tracking-wide">
              Gestión Avanzada de Tareas & Housekeeping
            </h2>
            <p className="text-xs text-slate-400">
              Control en tiempo real de sábanas, limpieza post checkout, mantenimiento y campos dinámicos No-Code.
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

      {/* Navegador por Pestañas del Sistema Operativo */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/5 scrollbar-thin">
        {[
          { id: "floor_plan", label: "Matriz de Planta & Plano", icon: LayoutGrid, count: spaces.length },
          { id: "kanban", label: "Tablero Kanban Tareas", icon: Grid, count: tasks.length },
          { id: "pwa_staff", label: "Modo PWA Móvil Staff", icon: Smartphone, badge: "Camareras" },
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
              {t.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? "bg-[#00C8D4]/30 text-[#00C8D4]" : "bg-slate-800 text-slate-300"}`}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── PESTAÑA 1: MATRIZ DE PLANTA & PLANO INTERACTIVO ── */}
      {activeTab === "floor_plan" && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/40 p-4 rounded-2xl border border-white/5">
            <div>
              <h3 className="text-sm font-bold font-serif text-white uppercase tracking-wider flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-[#00C8D4]" />
                Estado Operativo del Mapa de Habitaciones
              </h3>
              <p className="text-[11px] text-slate-400">Haz clic en cualquier habitación para cambiar su estado o generar eventos PMS.</p>
            </div>

            {/* Leyenda de Colores */}
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

          {/* Grilla de Habitaciones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {spaces.map(s => {
              const isClean = s.cleaning_status === "clean" || s.cleaning_status === "inspected";
              const isInProgress = s.cleaning_status === "in_progress";
              const isOutOfOrder = s.maintenance_status === "critical_lock" || s.cleaning_status === "out_of_service";
              const isDirty = s.cleaning_status === "dirty";

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

                    {/* Menú de Acciones Rápidas */}
                    <div className="flex items-center gap-1">
                      {!isClean && (
                        <button
                          onClick={() => {
                            triggerPMSEvent(establishmentId, "SUPERVISOR_INSPECT", s.code);
                          }}
                          className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[9px] font-bold rounded-lg cursor-pointer"
                          title="Marcar como limpia/inspeccionada"
                        >
                          Limpiar
                        </button>
                      )}
                      {isClean && (
                        <button
                          onClick={() => {
                            triggerPMSEvent(establishmentId, "CHECK_OUT", s.code);
                          }}
                          className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-[9px] font-bold rounded-lg cursor-pointer"
                          title="Simular Check-out y solicitar limpieza"
                        >
                          Check-out
                        </button>
                      )}
                      <button
                        onClick={() => {
                          triggerPMSEvent(establishmentId, "CRITICAL_INCIDENT", s.code, { issueDescription: "Falla eléctrica reportada" });
                        }}
                        className="px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-[9px] font-bold rounded-lg cursor-pointer"
                        title="Bloquear por falla técnica"
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
          
          {/* Columna: Pendientes */}
          <div className="bg-slate-950/40 border border-white/5 rounded-3xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" /> Pendientes ({tasks.filter(t => t.status === "pending").length})
              </span>
            </div>
            
            <div className="space-y-3">
              {tasks.filter(t => t.status === "pending").map(t => (
                <div key={t.id} className="bg-[#121620] border border-white/10 rounded-2xl p-4 space-y-2 hover:border-[#00C8D4]/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      {t.priority}
                    </span>
                    {t.space_code && <span className="font-mono text-[9px] font-bold text-[#00C8D4]">{t.space_code}</span>}
                  </div>
                  <h5 className="text-xs font-bold text-white">{t.title}</h5>
                  <p className="text-[10px] text-slate-400 line-clamp-2">{t.description}</p>
                  
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-400">
                    <span>{t.assigned_staff_name}</span>
                    <button
                      onClick={() => handleUpdateTaskStatus(t.id, "in_progress")}
                      className="px-2 py-1 bg-[#00C8D4] text-[#0b0c10] font-black rounded-lg cursor-pointer"
                    >
                      Iniciar →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Columna: En Progreso / Limpieza */}
          <div className="bg-slate-950/40 border border-white/5 rounded-3xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" /> En Progreso ({tasks.filter(t => t.status === "in_progress").length})
              </span>
            </div>

            <div className="space-y-3">
              {tasks.filter(t => t.status === "in_progress").map(t => (
                <div key={t.id} className="bg-[#121620] border border-amber-500/30 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-500/10 text-amber-400">
                      En Limpieza
                    </span>
                    {t.space_code && <span className="font-mono text-[9px] font-bold text-[#00C8D4]">{t.space_code}</span>}
                  </div>
                  <h5 className="text-xs font-bold text-white">{t.title}</h5>
                  <p className="text-[10px] text-slate-400">{t.description}</p>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-400">
                    <span>{t.assigned_staff_name}</span>
                    <button
                      onClick={() => handleUpdateTaskStatus(t.id, "inspected")}
                      className="px-2 py-1 bg-amber-500 text-slate-950 font-black rounded-lg cursor-pointer"
                    >
                      Solicitar Inspección →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Columna: Por Inspeccionar */}
          <div className="bg-slate-950/40 border border-white/5 rounded-3xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-400" /> Por Inspeccionar ({tasks.filter(t => t.status === "inspected").length})
              </span>
            </div>

            <div className="space-y-3">
              {tasks.filter(t => t.status === "inspected").map(t => (
                <div key={t.id} className="bg-[#121620] border border-purple-500/30 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black bg-purple-500/10 text-purple-400">
                      Supervisión Ama de Llaves
                    </span>
                    {t.space_code && <span className="font-mono text-[9px] font-bold text-[#00C8D4]">{t.space_code}</span>}
                  </div>
                  <h5 className="text-xs font-bold text-white">{t.title}</h5>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-400">
                    <span>{t.assigned_staff_name}</span>
                    <button
                      onClick={() => handleUpdateTaskStatus(t.id, "completed")}
                      className="px-2 py-1 bg-purple-500 text-white font-black rounded-lg cursor-pointer"
                    >
                      Aprobar ✨
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Columna: Completadas / Listas */}
          <div className="bg-slate-950/40 border border-white/5 rounded-3xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Operativas ({tasks.filter(t => t.status === "completed").length})
              </span>
            </div>

            <div className="space-y-3">
              {tasks.filter(t => t.status === "completed").map(t => (
                <div key={t.id} className="bg-[#121620] border border-emerald-500/30 rounded-2xl p-4 space-y-2 opacity-80 hover:opacity-100 transition-opacity">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500/10 text-emerald-400">
                      ✨ Lista para Check-in
                    </span>
                    {t.space_code && <span className="font-mono text-[9px] font-bold text-[#00C8D4]">{t.space_code}</span>}
                  </div>
                  <h5 className="text-xs font-bold text-white">{t.title}</h5>
                  <span className="text-[9px] text-slate-400 block">{t.assigned_staff_name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ── PESTAÑA 3: MODO PWA MÓVIL PARA STAFF ── */}
      {activeTab === "pwa_staff" && (
        <div className="max-w-md mx-auto bg-[#0e011f] border border-white/20 rounded-3xl p-5 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#FF0096]" />
              <div>
                <h4 className="text-xs font-black font-serif text-white uppercase">App Móvil Staff PWA</h4>
                <p className="text-[9px] text-slate-400">Camarera de Turno: María Delgado</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-emerald-500/20 text-emerald-400">Online Sincronizado</span>
          </div>

          {/* Tarjeta de Tarea Activa */}
          <div className="bg-[#1a0533] border border-[#FF0096]/40 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs font-bold text-[#00C8D4]">HAB-301</span>
              <span className="px-2 py-0.5 rounded text-[9px] font-black bg-[#FF0096]/20 text-[#FF0096]">Limpieza Check-out</span>
            </div>
            <h5 className="text-sm font-bold text-white">Suite Presidencial Vista al Mar</h5>

            {/* Checklist Interactivo */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Checklist Digital de Inspección:</span>
              <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-[#FF0096] w-4 h-4" />
                <span>Cambio completo de sábanas y edredón</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-[#FF0096] w-4 h-4" />
                <span>Sanitización de jacuzzi y baños</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                <input type="checkbox" className="accent-[#FF0096] w-4 h-4" />
                <span>Reposición de batas y amenidades VIP</span>
              </label>
            </div>

            {/* Carga de Foto Obligatoria (Custom Field) */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <span className="text-[9px] uppercase font-bold text-[#00C8D4] block flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" /> Foto Obligatoria del Baño Limpio
              </span>
              <div className="p-3 bg-black/40 border border-dashed border-white/20 rounded-xl text-center cursor-pointer hover:border-[#00C8D4] transition-colors">
                <Camera className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <span className="text-[10px] text-slate-300 font-bold block">Tomar Fotografía con la Cámara</span>
              </div>
            </div>

            <button
              onClick={() => alert("¡Fotografía registrada y tarea completada enviada a la supervisora!")}
              className="w-full py-3 bg-[#FF0096] hover:bg-[#d40085] text-white rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg active:scale-97 transition-all mt-2"
            >
              Completar & Enviar Fotografía
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
                Motor No-Code Builder de Campos Personalizados
              </h3>
              <p className="text-[11px] text-slate-400">Crea nuevos atributos y reglas de inspección para tu posada o resort sin programar nada.</p>
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
                Mantenimiento Técnico e Instalaciones (Out of Order)
              </h3>
              <p className="text-[11px] text-slate-400">Control de fallas eléctricas, plomería, A/C e inhabilitación automática en el PMS.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.length === 0 ? (
              <div className="col-span-2 py-12 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl">
                <Wrench className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-xs">No hay tickets de mantenimiento técnico abiertos actualmente.</p>
              </div>
            ) : (
              tickets.map(t => (
                <div key={t.id} className="p-5 bg-slate-950/40 border border-purple-500/30 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-[#00C8D4]">{t.space_code}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-purple-500/20 text-purple-300">
                      {t.severity}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{t.issue_type}</h4>
                  <p className="text-xs text-slate-400">{t.equipment_name}</p>
                  <div className="pt-2 border-t border-white/5 flex justify-between items-center text-xs">
                    <span className="text-[10px] text-slate-400">Técnico: <strong className="text-white">{t.technician_assigned}</strong></span>
                    {t.blocks_inventory && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-rose-500/20 text-rose-400">
                        Inhabilita Ventas PMS
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── MODAL PARA CREAR NUEVO CAMPO PERSONALIZADO (NO-CODE BUILDER) ── */}
      {showNewFieldModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#121620] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h4 className="text-sm font-bold font-serif text-white uppercase">Crear Campo Personalizado</h4>
              <button onClick={() => setShowNewFieldModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateCustomField} className="space-y-4">
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Nombre del Campo</label>
                <input
                  type="text"
                  required
                  value={fieldName}
                  onChange={e => setFieldName(e.target.value)}
                  placeholder="Ej: Foto Obligatoria del Balcón"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Tipo de Campo</label>
                <select
                  value={fieldType}
                  onChange={e => setFieldType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                >
                  <option value="text" className="bg-slate-900">Texto Libre</option>
                  <option value="photo" className="bg-slate-900">Fotografía Obligatoria</option>
                  <option value="signature" className="bg-slate-900">Firma Digital</option>
                  <option value="boolean" className="bg-slate-900">Sí / No (Booleano)</option>
                  <option value="number" className="bg-slate-900">Número / Medición</option>
                  <option value="currency" className="bg-slate-900">Monto Monetario ($ USD)</option>
                </select>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={fieldRequired}
                  onChange={e => setFieldRequired(e.target.checked)}
                  className="accent-[#FF0096] w-4 h-4"
                />
                <span>Campo de Respuesta Obligatoria</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowNewFieldModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black uppercase bg-[#00C8D4] text-[#0b0c10]"
                >
                  Guardar Campo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL PARA CREAR NUEVA TAREA OPERATIVA ── */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#121620] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h4 className="text-sm font-bold font-serif text-white uppercase">Crear Nueva Tarea Operativa</h4>
              <button onClick={() => setShowAddTaskModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Título de la Tarea</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  placeholder="Ej: Limpieza profunda post evento"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Habitación / Espacio</label>
                  <select
                    value={taskRoomCode}
                    onChange={e => setTaskRoomCode(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  >
                    <option value="">Instalación General</option>
                    {spaces.map(s => (
                      <option key={s.id} value={s.code} className="bg-slate-900">{s.code} - {s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Categoría</label>
                  <select
                    value={taskCategory}
                    onChange={e => setTaskCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  >
                    <option value="housekeeping" className="bg-slate-900">Housekeeping</option>
                    <option value="maintenance" className="bg-slate-900">Mantenimiento</option>
                    <option value="minibar" className="bg-slate-900">Minibar / Reemplazo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Personal Asignado</label>
                <input
                  type="text"
                  value={taskAssignedTo}
                  onChange={e => setTaskAssignedTo(e.target.value)}
                  placeholder="Ej: María Delgado (Camarera)"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black uppercase bg-[#FF0096] text-white"
                >
                  Crear Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
