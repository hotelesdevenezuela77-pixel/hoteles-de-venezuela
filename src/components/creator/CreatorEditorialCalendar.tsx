import React, { useState } from "react";
import { Calendar, Plus, CheckCircle2, Clock, Video, Eye, Share2, Sparkles, MoveRight } from "lucide-react";
import type { CreatorEditorialTask, TaskStatus } from "../../types/creatorInfluencer";

interface CreatorEditorialCalendarProps {
  tasks: CreatorEditorialTask[];
  onAddTask: (task: Partial<CreatorEditorialTask>) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
}

const COLUMNS: { id: TaskStatus; label: string; color: string; bg: string } = {
  todo: { label: "📝 Por Rodar / Planificar", color: "border-slate-500 text-slate-300", bg: "bg-slate-950/40" },
  editing: { label: "🎬 En Edición de Video", color: "border-sky-500 text-sky-300", bg: "bg-sky-950/30" },
  review: { label: "👁️ En Revisión / Marca", color: "border-amber-500 text-amber-300", bg: "bg-amber-950/30" },
  published: { label: "🚀 Publicado en Redes", color: "border-emerald-500 text-emerald-300", bg: "bg-emerald-950/30" }
};

export const CreatorEditorialCalendar: React.FC<CreatorEditorialCalendarProps> = ({
  tasks,
  onAddTask,
  onUpdateStatus
}) => {
  const [taskName, setTaskName] = useState("");
  const [platform, setPlatform] = useState("instagram_reel");
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 3 * 24 * 3600000).toISOString().split("T")[0]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    onAddTask({
      task_name: taskName.trim(),
      platform,
      due_date: dueDate
    });

    setTaskName("");
  };

  return (
    <div className="rounded-3xl bg-[#1a0533]/80 border border-white/10 p-6 shadow-2xl backdrop-blur-md mb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-5 mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FF0096] flex items-center justify-center shadow-lg shadow-[#FF0096]/20">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">Calendario Editorial & Flujo Drag & Drop</h3>
            <p className="text-xs text-slate-400">Organización visual de rodaje, edición, revisión de marcas y publicaciones</p>
          </div>
        </div>
      </div>

      {/* Formulario Nueva Tarea Editorial */}
      <form onSubmit={handleCreateTask} className="mb-6 p-4 rounded-2xl bg-slate-900/70 border border-white/10 flex flex-col sm:flex-row items-end gap-3 text-xs">
        <div className="flex-1 w-full">
          <label className="block text-slate-300 font-semibold mb-1">Nombre del Entregable / Video</label>
          <input
            type="text"
            required
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Ej: Reel '5 Razones para visitar Roraima'"
            className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-[#FF0096]"
          />
        </div>

        <div className="w-full sm:w-48">
          <label className="block text-slate-300 font-semibold mb-1">Plataforma</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-white text-xs font-bold"
          >
            <option value="instagram_reel">Instagram Reel</option>
            <option value="tiktok">TikTok Video</option>
            <option value="hdv_review">Reseña Hoteles de Venezuela</option>
            <option value="youtube_video">YouTube Vlog 4K</option>
            <option value="instagram_stories">Historias (Pack 3x)</option>
          </select>
        </div>

        <div className="w-full sm:w-40">
          <label className="block text-slate-300 font-semibold mb-1">Fecha Límite</label>
          <input
            type="date"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-white text-xs"
          />
        </div>

        <button
          type="submit"
          disabled={!taskName.trim()}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white font-extrabold text-xs shadow-lg hover:opacity-95 transition-all uppercase shrink-0"
        >
          AGREGAR A TABLERO
        </button>
      </form>

      {/* Tablero Visual Drag-and-Drop Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(COLUMNS) as TaskStatus[]).map((statusKey) => {
          const colInfo = COLUMNS[statusKey];
          const colTasks = tasks.filter((t) => t.status === statusKey);

          return (
            <div key={statusKey} className={`rounded-2xl border p-4 ${colInfo.bg} ${colInfo.color}`}>
              <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                <span className="font-extrabold text-xs uppercase tracking-wider">{colInfo.label}</span>
                <span className="w-5 h-5 rounded-full bg-black/40 flex items-center justify-center font-mono font-bold text-[10px] text-white">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[220px]">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 shadow-md space-y-2 hover:border-[#FF0096]/40 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-[#FF0096]/20 text-[#FF0096]">
                        {task.platform.replace("_", " ")}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {task.due_date}
                      </span>
                    </div>

                    <h5 className="font-bold text-white text-xs leading-snug">{task.task_name}</h5>

                    {/* Mover estado interactivo */}
                    <div className="pt-2 border-t border-white/10 flex justify-end space-x-1">
                      {statusKey !== "todo" && (
                        <button
                          onClick={() => {
                            const prevStatus: { [key in TaskStatus]?: TaskStatus } = {
                              editing: "todo",
                              review: "editing",
                              published: "review"
                            };
                            if (prevStatus[statusKey]) onUpdateStatus(task.id, prevStatus[statusKey]!);
                          }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
                          title="Mover a etapa anterior"
                        >
                          ←
                        </button>
                      )}

                      {statusKey !== "published" && (
                        <button
                          onClick={() => {
                            const nextStatus: { [key in TaskStatus]?: TaskStatus } = {
                              todo: "editing",
                              editing: "review",
                              review: "published"
                            };
                            if (nextStatus[statusKey]) onUpdateStatus(task.id, nextStatus[statusKey]!);
                          }}
                          className="px-2.5 py-1 rounded bg-[#FF0096] hover:opacity-90 text-white text-[10px] font-bold flex items-center space-x-1"
                        >
                          <span>Mover</span>
                          <MoveRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
