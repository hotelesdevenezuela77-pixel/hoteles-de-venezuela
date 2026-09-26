import React, { useState } from "react";
import {
  Clipboard, Plus, CheckCircle2, Clock, Video, Film, Camera,
  Share2, Sparkles, Award, Building2, MapPin, Trash2, Edit3,
  Check, ArrowRight, Zap, Layers, Smartphone, RefreshCw, X
} from "lucide-react";

export type ProductionTaskStatus = "planificacion" | "rodaje" | "edicion" | "revision" | "publicado";

export interface CreatorProductionTask {
  id: string;
  establishment_id: number;
  title: string;
  format: "reel_4k" | "tiktok" | "hdv_review" | "youtube_vlog" | "pack_historias" | "galeria_fotos";
  target_establishment: string;
  destination: string;
  due_date: string;
  status: ProductionTaskStatus;
  sponsor?: string;
  priority: "urgente" | "alta" | "normal";
  notes?: string;
}

interface CreatorTasksModuleProps {
  establishmentId: number;
  creatorName: string;
}

const COLUMNS: { id: ProductionTaskStatus; label: string; color: string; bg: string } = {
  planificacion: { label: "📝 Por Planificar / Guiones", color: "border-slate-500 text-slate-300", bg: "bg-slate-950/40" },
  rodaje: { label: "🎬 En Rodaje / Grabación de Campo", color: "border-[#FF0096] text-pink-300", bg: "bg-pink-950/20" },
  edicion: { label: "✂️ En Edición / Post-Producción", color: "border-[#00C8D4] text-cyan-300", bg: "bg-cyan-950/20" },
  revision: { label: "👁️ En Revisión con Marca / Posada", color: "border-amber-500 text-amber-300", bg: "bg-amber-950/20" },
  publicado: { label: "🚀 Publicado & Liquidado HDV", color: "border-emerald-500 text-emerald-300", bg: "bg-emerald-950/20" }
};

const FORMAT_LABELS: Record<string, string> = {
  reel_4k: "Instagram Reel 4K",
  tiktok: "TikTok Video Viral",
  hdv_review: "Reseña Oficial HDV",
  youtube_vlog: "YouTube Vlog Expedición",
  pack_historias: "Pack Historias (5x)",
  galeria_fotos: "Pack Fotos High-Res (10x)"
};

export function CreatorTasksModule({ establishmentId, creatorName }: CreatorTasksModuleProps) {
  const localKey = `hdv_creator_tasks_${establishmentId}`;

  const [tasks, setTasks] = useState<CreatorProductionTask[]>(() => {
    try {
      const raw = localStorage.getItem(localKey);
      if (raw) return JSON.parse(raw);
    } catch (e) {}

    return [
      {
        id: "task-1",
        establishment_id: establishmentId,
        title: "Reel 4K: Los 3 Mejores Arrecifes de Morrocoy",
        format: "reel_4k",
        target_establishment: "Posada Perla Negra",
        destination: "Tucacas / Morrocoy",
        due_date: new Date(Date.now() + 2 * 24 * 3600000).toISOString().split("T")[0],
        status: "rodaje",
        sponsor: "Posada Perla Negra",
        priority: "alta",
        notes: "Incluir tomas aéreas de Cayo Sombrero y Cayo Muerto con tomas de desayuno."
      },
      {
        id: "task-2",
        establishment_id: establishmentId,
        title: "Reseña Técnica HDV: Auditoría de Wi-Fi y Planta",
        format: "hdv_review",
        target_establishment: "Hotel Gran Sabana Lodge",
        destination: "Gran Sabana",
        due_date: new Date(Date.now() + 5 * 24 * 3600000).toISOString().split("T")[0],
        status: "planificacion",
        sponsor: "Hoteles de Venezuela",
        priority: "urgente",
        notes: "Verificar medición de 120 Mbps y conmutador automático de planta."
      },
      {
        id: "task-3",
        establishment_id: establishmentId,
        title: "Edición Cinematic: Travesía 4x4 Paso de los Andes",
        format: "youtube_vlog",
        target_establishment: "Posada Los Nevados",
        destination: "Mérida",
        due_date: new Date(Date.now() + 7 * 24 * 3600000).toISOString().split("T")[0],
        status: "edicion",
        sponsor: "Marca Outdoor 4x4",
        priority: "normal",
        notes: "LUTs fríos para páramo andino y estabilización de tomas en carretera."
      },
      {
        id: "task-4",
        establishment_id: establishmentId,
        title: "Pack de 5 Historias de Cobertura de Bienvenida",
        format: "pack_historias",
        target_establishment: "Aparto Posada del Mar",
        destination: "Chichiriviche",
        due_date: new Date().toISOString().split("T")[0],
        status: "publicado",
        sponsor: "Aparto Posada del Mar",
        priority: "alta",
        notes: "Etiquetar cuenta oficial y añadir enlace de reserva directa."
      }
    ];
  });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<CreatorProductionTask | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    format: "reel_4k" as CreatorProductionTask["format"],
    target_establishment: "",
    destination: "",
    due_date: new Date(Date.now() + 3 * 24 * 3600000).toISOString().split("T")[0],
    status: "planificacion" as ProductionTaskStatus,
    sponsor: "",
    priority: "alta" as "urgente" | "alta" | "normal",
    notes: ""
  });

  // Drag & Drop State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const saveTasks = (newTasks: CreatorProductionTask[]) => {
    setTasks(newTasks);
    localStorage.setItem(localKey, JSON.stringify(newTasks));
  };

  const handleOpenCreate = () => {
    setEditingTask(null);
    setFormData({
      title: "",
      format: "reel_4k",
      target_establishment: "",
      destination: "",
      due_date: new Date(Date.now() + 3 * 24 * 3600000).toISOString().split("T")[0],
      status: "planificacion",
      sponsor: "",
      priority: "alta",
      notes: ""
    });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingTask) {
      const updated = tasks.map(t => {
        if (t.id === editingTask.id) {
          return {
            ...t,
            title: formData.title.trim(),
            format: formData.format,
            target_establishment: formData.target_establishment.trim() || "Establecimiento Turístico",
            destination: formData.destination.trim() || "Venezuela",
            due_date: formData.due_date,
            status: formData.status,
            sponsor: formData.sponsor.trim(),
            priority: formData.priority,
            notes: formData.notes.trim()
          };
        }
        return t;
      });
      saveTasks(updated);
    } else {
      const newTask: CreatorProductionTask = {
        id: `task-${Date.now()}`,
        establishment_id: establishmentId,
        title: formData.title.trim(),
        format: formData.format,
        target_establishment: formData.target_establishment.trim() || "Establecimiento Turístico",
        destination: formData.destination.trim() || "Venezuela",
        due_date: formData.due_date,
        status: formData.status,
        sponsor: formData.sponsor.trim(),
        priority: formData.priority,
        notes: formData.notes.trim()
      };
      saveTasks([...tasks, newTask]);
    }

    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Deseas eliminar esta tarea de producción?")) return;
    const filtered = tasks.filter(t => t.id !== id);
    saveTasks(filtered);
  };

  const handleMoveStatus = (id: string, newStatus: ProductionTaskStatus) => {
    const updated = tasks.map(t => {
      if (t.id === id) return { ...t, status: newStatus };
      return t;
    });
    saveTasks(updated);
  };

  // Drag & Drop
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropColumn = (status: ProductionTaskStatus) => {
    if (!draggedTaskId) return;
    handleMoveStatus(draggedTaskId, status);
    setDraggedTaskId(null);
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      
      {/* ── BANNER PRINCIPAL ── */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#1a0533] via-[#0e011f] to-[#1a0533] border border-[#00C8D4]/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-15 bg-[#00C8D4]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15 bg-[#FF0096]" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-[#FF0096]/20 text-[#FF0096] border border-[#FF0096]/40">
              <Clipboard className="w-3.5 h-3.5" />
              <span>GESTIÓN DE TAREAS & FLUJO KANBAN DE PRODUCCIÓN AUDIOVISUAL</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-wide">
              Entregables, Rodajes & Pautas de Creador
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Administra el ciclo de vida de tus contenidos: guionización, grabación de campo, edición, visto bueno de marcas patrocinadoras y publicación oficial con drag & drop.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl text-xs font-black text-white shadow-xl hover:scale-103 active:scale-97 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20 shrink-0"
            style={{ background: "linear-gradient(135deg, #FF0096 0%, #9B00CC 100%)" }}
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Tarea de Contenido</span>
          </button>
        </div>
      </div>

      {/* ── TABLERO KANBAN DRAG & DROP (5 COLUMNAS DE PRODUCCIÓN) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {(Object.keys(COLUMNS) as ProductionTaskStatus[]).map((statusKey) => {
          const colInfo = COLUMNS[statusKey];
          const colTasks = tasks.filter((t) => t.status === statusKey);

          return (
            <div
              key={statusKey}
              onDragOver={handleDragOver}
              onDrop={() => handleDropColumn(statusKey)}
              className={`rounded-3xl border p-4 flex flex-col justify-between transition-all min-h-[480px] ${colInfo.bg} ${colInfo.color}`}
            >
              <div>
                {/* Cabecera de Columna */}
                <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
                  <span className="font-extrabold text-xs tracking-wider leading-tight">{colInfo.label}</span>
                  <span className="w-5 h-5 rounded-full bg-black/50 flex items-center justify-center font-mono font-bold text-[10px] text-white shrink-0">
                    {colTasks.length}
                  </span>
                </div>

                {/* Tarjetas de Tarea */}
                <div className="space-y-3">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="p-4 rounded-2xl bg-black/60 border border-white/10 shadow-lg space-y-2.5 hover:border-[#00C8D4]/50 transition-all cursor-grab active:cursor-grabbing group"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-[#FF0096]/20 text-[#FF0096] border border-[#FF0096]/30">
                          {FORMAT_LABELS[task.format] || task.format}
                        </span>

                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                          task.priority === "urgente" ? "bg-red-500/20 text-red-300 border border-red-500/40" : "bg-white/10 text-slate-300"
                        }`}>
                          {task.priority}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white leading-snug font-serif">
                        {task.title}
                      </h4>

                      <div className="text-[10px] text-slate-300 space-y-0.5">
                        <div className="flex items-center gap-1 text-[#00C8D4] truncate">
                          <Building2 className="w-3 h-3 shrink-0" />
                          <span className="truncate">{task.target_establishment}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <MapPin className="w-3 h-3 text-[#FF0096] shrink-0" />
                          <span className="truncate">{task.destination}</span>
                        </div>
                      </div>

                      {task.notes && (
                        <p className="text-[10px] text-slate-400 italic line-clamp-2 pt-1 border-t border-white/10">
                          "{task.notes}"
                        </p>
                      )}

                      {/* Footer de Tarjeta con fecha y eliminar */}
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-slate-400">
                        <span>📅 {task.due_date}</span>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="p-1 rounded text-slate-500 hover:text-red-400 transition"
                          title="Eliminar tarea"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="p-6 text-center rounded-2xl border border-dashed border-white/10 text-slate-500 text-[11px]">
                      Arrastra tareas aquí
                    </div>
                  )}
                </div>
              </div>

              {/* Botón rápido para agregar a esta columna */}
              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, status: statusKey }));
                  setShowModal(true);
                }}
                className="mt-3 w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Agregar</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* ── MODAL CREAR / EDITAR TAREA ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#1a0533] rounded-3xl w-full max-w-lg shadow-2xl border border-white/15 p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF0096] to-[#00C8D4] flex items-center justify-center text-white shadow-lg">
                  <Clipboard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif text-white">
                    {editingTask ? "Editar Tarea de Contenido" : "Nueva Tarea de Producción"}
                  </h3>
                  <p className="text-xs text-slate-300">Asignada a la producción de {creatorName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-5 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Título del Contenido / Video *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Reel 4K de Bahía de Mochima con Drone"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#00C8D4]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Formato Audiovisual
                  </label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white font-bold"
                  >
                    {Object.entries(FORMAT_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white font-bold"
                  >
                    <option value="urgente">🔥 Urgente / Entrega Inmediata</option>
                    <option value="alta">⚡ Alta Prioridad</option>
                    <option value="normal">✨ Normal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Establecimiento Turístico Asociado
                  </label>
                  <input
                    type="text"
                    value={formData.target_establishment}
                    onChange={(e) => setFormData({ ...formData, target_establishment: e.target.value })}
                    placeholder="Ej: Posada Perla Negra"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#00C8D4]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Destino / Locación
                  </label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    placeholder="Ej: Morrocoy, Falcón"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#00C8D4]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Etapa / Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white font-bold"
                  >
                    {Object.entries(COLUMNS).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Fecha Límite de Entrega
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Pautas Creativas & Notas de Rodaje
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Tomas clave requeridas, ángulos de drone, mención de marcas..."
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#00C8D4]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#00C8D4] hover:opacity-90 text-white font-black shadow-lg"
                >
                  Guardar Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
