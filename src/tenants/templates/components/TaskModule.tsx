import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { 
  ClipboardList, Plus, Trash2, CheckCircle2, 
  Clock, AlertTriangle, User, Loader2, ArrowRight
} from "lucide-react";

interface Task {
  id: string;
  establishment_id: number;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed";
  assigned_to: string;
  created_at: string;
}

interface TaskModuleProps {
  establishmentId: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export function TaskModule({ establishmentId, primaryColor, secondaryColor, accentColor }: TaskModuleProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para nueva tarea
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [assignedTo, setAssignedTo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const localKey = `hdv_tasks_${establishmentId}`;

  // Cargar tareas (Supabase con Logical Isolation + Fallback LocalStorage)
  const loadTasks = async () => {
    try {
      setLoading(true);
      
      // 1. Intentar consultar de la base de datos centralizada
      const { data, error } = await supabase
        .from("hotel_tasks")
        .select("*")
        .eq("establishment_id", establishmentId)
        .order("created_at", { ascending: false });

      if (error || !data) {
        throw new Error("Tabla hotel_tasks no accesible");
      }
      
      setTasks(data);
      localStorage.setItem(localKey, JSON.stringify(data));
    } catch (e) {
      console.warn("[PMS Tareas] Falló consulta a DB. Cargando desde almacenamiento local seguro.");
      // Fallback robusto
      const localData = localStorage.getItem(localKey);
      if (localData) {
        setTasks(JSON.parse(localData));
      } else {
        // Inicializar con tareas de prueba por defecto
        const defaultTasks: Task[] = [
          {
            id: "1",
            establishment_id: establishmentId,
            title: "Limpieza profunda Suite Principal",
            description: "Preparar habitación 204 para check-in de las 3:00 PM.",
            priority: "high",
            status: "pending",
            assigned_to: "María Delgado (Camarera)",
            created_at: new Date().toISOString()
          },
          {
            id: "2",
            establishment_id: establishmentId,
            title: "Mantenimiento aire acondicionado",
            description: "Revisar goteo y limpiar filtros de la habitación 102.",
            priority: "medium",
            status: "in_progress",
            assigned_to: "Carlos Pérez (Técnico)",
            created_at: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: "3",
            establishment_id: establishmentId,
            title: "Reposición de Minibar",
            description: "Colocar aguas, cervezas y snacks en todas las suites ejecutivas.",
            priority: "low",
            status: "completed",
            assigned_to: "Juan Torres (Botones)",
            created_at: new Date(Date.now() - 7200000).toISOString()
          }
        ];
        setTasks(defaultTasks);
        localStorage.setItem(localKey, JSON.stringify(defaultTasks));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [establishmentId]);

  // Guardar nueva tarea
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setIsSubmitting(true);
    const newTask: Task = {
      id: crypto.randomUUID(),
      establishment_id: establishmentId,
      title,
      description,
      priority,
      status: "pending",
      assigned_to: assignedTo || "Sin asignar",
      created_at: new Date().toISOString()
    };

    try {
      // 1. Guardar en Supabase
      const { error } = await supabase.from("hotel_tasks").insert([newTask]);
      if (error) throw error;
      
      const updated = [newTask, ...tasks];
      setTasks(updated);
      localStorage.setItem(localKey, JSON.stringify(updated));
    } catch (err) {
      console.warn("[PMS Tareas] Guardando tarea localmente:", err);
      const updated = [newTask, ...tasks];
      setTasks(updated);
      localStorage.setItem(localKey, JSON.stringify(updated));
    } finally {
      setIsSubmitting(false);
      setShowAddForm(false);
      setTitle("");
      setDescription("");
      setPriority("medium");
      setAssignedTo("");
    }
  };

  // Cambiar el estado de una tarea
  const handleUpdateStatus = async (id: string, newStatus: "pending" | "in_progress" | "completed") => {
    const updated = tasks.map(t => t.id === id ? { ...t, status: newStatus } : t);
    setTasks(updated);
    localStorage.setItem(localKey, JSON.stringify(updated));

    try {
      await supabase
        .from("hotel_tasks")
        .update({ status: newStatus })
        .eq("id", id)
        .eq("establishment_id", establishmentId);
    } catch (err) {
      console.warn("[PMS Tareas] Falló actualización remota de estado de tarea.");
    }
  };

  // Eliminar una tarea
  const handleDeleteTask = async (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    localStorage.setItem(localKey, JSON.stringify(updated));

    try {
      await supabase
        .from("hotel_tasks")
        .delete()
        .eq("id", id)
        .eq("establishment_id", establishmentId);
    } catch (err) {
      console.warn("[PMS Tareas] Falló borrado remoto de tarea.");
    }
  };

  const getPriorityStyle = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "bg-rose-500/10 text-rose-500 border border-rose-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
      case "low":
        return "bg-[#00C8D4]/10 text-[#00C8D4] border border-[#00C8D4]/20";
    }
  };

  const getStatusIcon = (status: "pending" | "in_progress" | "completed") => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-slate-400 animate-pulse" />;
      case "in_progress":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="bg-[#121620] border border-white/5 rounded-3xl p-6 shadow-xl space-y-6">
      
      {/* Header del Módulo */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-bold font-serif text-white tracking-wide">Gestión Operativa de Tareas</h3>
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mt-0.5">PMS - Control Interno del Staff</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-[#0b0c10] transition-transform active:scale-97 cursor-pointer"
          style={{ backgroundColor: accentColor }}
        >
          <Plus className="w-4 h-4" /> Nueva Tarea
        </button>
      </div>

      {/* Formulario de Adición */}
      {showAddForm && (
        <form onSubmit={handleAddTask} className="bg-slate-950/40 border border-white/10 rounded-2xl p-5 space-y-4 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Título de Tarea</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ej: Reparar tubería suite 10"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00C8D4]"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Personal Asignado</label>
              <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-[#00C8D4]">
                <User className="w-4 h-4 text-gray-500 shrink-0" />
                <input
                  type="text"
                  value={assignedTo}
                  onChange={e => setAssignedTo(e.target.value)}
                  placeholder="Ej: Carlos Gómez"
                  className="bg-transparent border-none outline-none text-xs text-white placeholder-gray-600 w-full"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[9px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Descripción y Detalles</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detalla lo que se necesita hacer..."
              rows={2}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00C8D4] resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              {["low", "medium", "high"].map((p) => (
                <label key={p} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    checked={priority === p}
                    onChange={() => setPriority(p as any)}
                    className="accent-[#FF0096]"
                  />
                  <span className="capitalize">{p === "low" ? "Baja" : p === "medium" ? "Media" : "Alta"}</span>
                </label>
              ))}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold text-[#0b0c10] uppercase flex items-center gap-1.5 active:scale-97 cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>Crear Tarea</span>
            </button>
          </div>
        </form>
      )}

      {/* Lista de Tareas */}
      {loading ? (
        <div className="py-12 flex justify-center text-slate-500">
          <Loader2 className="w-6 h-6 text-[#00C8D4] animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="py-12 text-center text-slate-600 border border-dashed border-white/10 rounded-2xl">
          <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-20" />
          <p className="text-xs">No hay tareas operativas pendientes de realizar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {tasks.map((t) => (
            <div 
              key={t.id} 
              className="bg-slate-950/20 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/10 transition-colors"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-md ${getPriorityStyle(t.priority)}`}>
                    {t.priority === "high" ? "Alta" : t.priority === "medium" ? "Media" : "Baja"}
                  </span>
                  <span className="text-xs font-bold text-white leading-tight">{t.title}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-light leading-relaxed">{t.description}</p>
                <div className="flex items-center gap-3 text-[10px] text-gray-500 font-semibold">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    Asignado: <strong className="text-slate-300 font-bold ml-0.5">{t.assigned_to}</strong>
                  </span>
                  <span>·</span>
                  <span>Creado: {new Date(t.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Controles de Estado */}
              <div className="flex items-center gap-3 justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-3.5 md:pt-0">
                <div className="flex items-center gap-1.5 bg-slate-950/50 rounded-xl p-1 border border-white/5">
                  <button
                    onClick={() => handleUpdateStatus(t.id, "pending")}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer ${
                      t.status === "pending" ? "bg-slate-800 text-white" : "text-gray-500 hover:text-white"
                    }`}
                  >
                    Pendiente
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(t.id, "in_progress")}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer ${
                      t.status === "in_progress" ? "bg-amber-500/20 text-amber-400" : "text-gray-500 hover:text-white"
                    }`}
                  >
                    Progreso
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(t.id, "completed")}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer ${
                      t.status === "completed" ? "bg-emerald-500/20 text-emerald-400" : "text-gray-500 hover:text-white"
                    }`}
                  >
                    Listo
                  </button>
                </div>

                <button
                  onClick={() => handleDeleteTask(t.id)}
                  className="p-2 hover:bg-rose-500/10 text-gray-500 hover:text-rose-500 rounded-xl transition-all cursor-pointer"
                  title="Eliminar Tarea"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
