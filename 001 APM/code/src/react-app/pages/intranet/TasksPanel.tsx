import { useState, useEffect } from "react";
import { Plus, X, Check, Clock, AlertTriangle, Filter, Search } from "lucide-react";

interface Task {
  id: number;
  title: string;
  description: string;
  room_id: number | null;
  room_code: string | null;
  task_type: string;
  priority: string;
  status: string;
  assigned_to: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
}

interface Room {
  id: number;
  code: string;
  building: string;
}

const TASK_TYPES = [
  { value: "limpieza", label: "Limpieza", color: "bg-cyan-100 text-cyan-700" },
  { value: "mantenimiento", label: "Mantenimiento", color: "bg-amber-100 text-amber-700" },
  { value: "recepcion", label: "Recepción", color: "bg-purple-100 text-purple-700" },
  { value: "piscina", label: "Piscina", color: "bg-blue-100 text-blue-700" },
  { value: "general", label: "General", color: "bg-slate-100 text-slate-700" },
];

const PRIORITIES = [
  { value: "baja", label: "Baja", color: "text-slate-500" },
  { value: "normal", label: "Normal", color: "text-blue-500" },
  { value: "alta", label: "Alta", color: "text-amber-500" },
  { value: "urgente", label: "Urgente", color: "text-red-500" },
];

const STATUSES = [
  { value: "pending", label: "Pendiente" },
  { value: "in_progress", label: "En Progreso" },
  { value: "completed", label: "Completada" },
];

export default function TasksPanel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTask, setShowNewTask] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    room_id: "",
    task_type: "general",
    priority: "normal",
    assigned_to: "",
    due_date: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, roomsRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/rooms"),
      ]);

      if (tasksRes.ok) {
        const data = await tasksRes.json();
        setTasks(data);
      }

      if (roomsRes.ok) {
        const data = await roomsRes.json();
        setRooms(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          room_id: formData.room_id ? parseInt(formData.room_id) : null,
        }),
      });

      if (res.ok) {
        setShowNewTask(false);
        setFormData({
          title: "",
          description: "",
          room_id: "",
          task_type: "general",
          priority: "normal",
          assigned_to: "",
          due_date: "",
        });
        fetchData();
      }
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const updateTaskStatus = async (taskId: number, status: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const deleteTask = async (taskId: number) => {
    if (!confirm("¿Eliminar esta tarea?")) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus !== "all" && task.status !== filterStatus) return false;
    if (filterType !== "all" && task.task_type !== filterType) return false;
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getTaskTypeInfo = (type: string) => {
    return TASK_TYPES.find((t) => t.value === type) || TASK_TYPES[4];
  };

  const getPriorityInfo = (priority: string) => {
    return PRIORITIES.find((p) => p.value === priority) || PRIORITIES[1];
  };

  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const completedTodayCount = tasks.filter((t) => {
    if (t.status !== "completed" || !t.completed_at) return false;
    const today = new Date().toISOString().split("T")[0];
    return t.completed_at.startsWith(today);
  }).length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">Tareas Operativas</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">Gestión de limpieza, mantenimiento y más</p>
        </div>
        <button
          onClick={() => setShowNewTask(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl hover:opacity-90 transition-opacity w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Nueva Tarea</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
            <p className="text-sm text-amber-600">Pendientes</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-700">{inProgressCount}</p>
            <p className="text-sm text-blue-600">En Progreso</p>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-700">{completedTodayCount}</p>
            <p className="text-sm text-emerald-600">Completadas Hoy</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar tarea..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        >
          <option value="all">Todos los tipos</option>
          {TASK_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Cargando...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No hay tareas. ¡Crea la primera!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTasks.map((task) => {
              const typeInfo = getTaskTypeInfo(task.task_type);
              const priorityInfo = getPriorityInfo(task.priority);

              return (
                <div
                  key={task.id}
                  className={`p-4 hover:bg-slate-50 transition-colors ${
                    task.status === "completed" ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Status checkbox */}
                    <button
                      onClick={() =>
                        updateTaskStatus(
                          task.id,
                          task.status === "completed" ? "pending" : "completed"
                        )
                      }
                      className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        task.status === "completed"
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-slate-300 hover:border-cyan-500"
                      }`}
                    >
                      {task.status === "completed" && <Check className="w-4 h-4" />}
                    </button>

                    {/* Task info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className={`font-semibold ${
                            task.status === "completed"
                              ? "text-slate-400 line-through"
                              : "text-slate-800"
                          }`}
                        >
                          {task.title}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                        {task.priority !== "normal" && (
                          <span className={`text-xs font-medium ${priorityInfo.color}`}>
                            {priorityInfo.label}
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-sm text-slate-500 mb-2">{task.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        {task.room_code && (
                          <span className="bg-slate-100 px-2 py-1 rounded">
                            Hab. {task.room_code}
                          </span>
                        )}
                        {task.assigned_to && <span>Asignado: {task.assigned_to}</span>}
                        {task.due_date && (
                          <span>
                            Vence: {new Date(task.due_date).toLocaleDateString("es-VE")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {task.status !== "completed" && (
                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                          className="text-xs px-2 py-1 border border-slate-200 rounded-lg"
                        >
                          <option value="pending">Pendiente</option>
                          <option value="in_progress">En Progreso</option>
                          <option value="completed">Completada</option>
                        </select>
                      )}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Task Modal */}
      {showNewTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Nueva Tarea</h3>
              <button
                onClick={() => setShowNewTask(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Ej: Limpiar habitación A1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  rows={3}
                  placeholder="Detalles adicionales..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tipo de Tarea
                  </label>
                  <select
                    value={formData.task_type}
                    onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    {TASK_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Habitación (opcional)
                </label>
                <select
                  value={formData.room_id}
                  onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="">Sin habitación asignada</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.code} - {room.building}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Asignado a
                  </label>
                  <input
                    type="text"
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Nombre del empleado"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Fecha límite
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewTask(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Crear Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer Credit */}
      <div className="text-center py-6 border-t border-slate-200 mt-8">
        <p className="text-slate-400 text-sm">
          Tecnología desarrollada por <span className="font-semibold text-slate-500">Webmasterpro Entertainment Corporation</span>
        </p>
        <p className="text-slate-400 text-sm">
          Smarth Eco Systems — <span className="text-cyan-600">Israel de Jesús</span>
        </p>
      </div>
    </div>
  );
}
