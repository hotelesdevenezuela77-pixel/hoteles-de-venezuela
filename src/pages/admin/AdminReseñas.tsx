import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { supabase } from "@/lib/supabase";
import {
  Star, Trash2, Search, Building2, User, AlertTriangle,
  ThumbsUp, ThumbsDown, MessageSquare, Loader2, Plus, Sparkles, X
} from "lucide-react";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className="w-3.5 h-3.5"
          fill={i <= rating ? "#F59E0B" : "none"}
          stroke={i <= rating ? "#F59E0B" : "#D1D5DB"}
        />
      ))}
      <span className="ml-1 text-xs font-semibold text-gray-650">{rating}/5</span>
    </div>
  );
}

export function AdminReseñas() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterRating, setFilterRating] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newLocationTag, setNewLocationTag] = useState("");
  const [newComment, setNewComment] = useState("");
  const [newRowPos, setNewRowPos] = useState<number>(1);
  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (m: string) => {
    setToastMsg(m);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleAddFeaturedReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newComment.trim()) {
      alert("Por favor completa el nombre del usuario y el comentario.");
      return;
    }

    const reviewObj = {
      id: Date.now(),
      user_name: newUserName,
      location_tag: newLocationTag || "Venezuela",
      comment: newComment,
      rating: 5,
      row_position: newRowPos,
      created_at: new Date().toISOString()
    };

    try {
      await supabase.from("customer_reviews").insert({
        user_name: newUserName,
        location_tag: newLocationTag || "Venezuela",
        comment: newComment,
        rating: 5,
        row_position: newRowPos
      });
    } catch (e) {
      console.warn("Fallback local para reseña destacada");
    }

    const localKey = "hdv_featured_reviews_custom";
    const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
    localStorage.setItem(localKey, JSON.stringify([reviewObj, ...existing]));

    setShowAddModal(false);
    setNewUserName("");
    setNewLocationTag("");
    setNewComment("");
    triggerToast("✨ Reseña animada agregada con éxito para la página principal.");
    qc.invalidateQueries({ queryKey: ["admin-reviews"] });
  };

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      setLocation("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Query to fetch reviews
  const { data: reviews = [], isLoading: loading } = useQuery<any[]>({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        
        const mapped = (data || []).map((r: any) => ({
          id: r.id,
          rating: r.rating || 5,
          comment: r.comment || "",
          userId: r.user_id || r.userId,
          establishmentId: r.establishment_id || r.establishmentId,
          createdAt: r.created_at || r.createdAt
        }));

        const localReviewKey = "hdv_mock_reviews";
        const localReviews = JSON.parse(localStorage.getItem(localReviewKey) || "[]");
        return [...mapped, ...localReviews];
      } catch (err) {
        const localReviewKey = "hdv_mock_reviews";
        const localReviews = JSON.parse(localStorage.getItem(localReviewKey) || "[]");
        if (localReviews.length === 0) {
          const defaults = [
            { id: 1, userId: "usr_abc123", establishmentId: 2, rating: 5, comment: "Excelente posada, muy buena atención y comida riquísima.", createdAt: new Date().toISOString() },
            { id: 2, userId: "usr_xyz789", establishmentId: 5, rating: 2, comment: "El aire acondicionado no enfriaba bien y el WiFi era algo lento.", createdAt: new Date().toISOString() },
          ];
          localStorage.setItem(localReviewKey, JSON.stringify(defaults));
          return defaults;
        }
        return localReviews;
      }
    },
    staleTime: 15000,
  });

  const deleteReview = useMutation({
    mutationFn: async (id: number) => {
      const localReviewKey = "hdv_mock_reviews";
      const localReviews = JSON.parse(localStorage.getItem(localReviewKey) || "[]");
      const isMock = localReviews.some((r: any) => r.id === id);

      if (isMock) {
        localStorage.setItem(localReviewKey, JSON.stringify(localReviews.filter((r: any) => r.id !== id)));
        return { success: true };
      }

      try {
        const { error } = await supabase
          .from("reviews")
          .delete()
          .eq("id", id);
        if (error) throw error;
      } catch (err) {
        localStorage.setItem(localReviewKey, JSON.stringify(localReviews.filter((r: any) => r.id !== id)));
      }
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      setConfirmDelete(null);
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
        <p className="text-gray-500 text-xs font-bold">Verificando credenciales de seguridad...</p>
      </div>
    );
  }

  const filtered = reviews.filter(r => {
    const matchRating = filterRating === 0 || r.rating === filterRating;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (r.comment ?? "").toLowerCase().includes(q) ||
      String(r.establishmentId).includes(q);
    return matchRating && matchSearch;
  });

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length
    : 0;

  const byRating = [5, 4, 3, 2, 1].map(n => ({
    n,
    count: reviews.filter(r => r.rating === n).length,
    pct: reviews.length > 0 ? (reviews.filter(r => r.rating === n).length / reviews.length) * 100 : 0,
  }));

  const positive = reviews.filter(r => r.rating >= 4).length;
  const negative = reviews.filter(r => r.rating <= 2).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 pb-24 font-sans">
      {/* Header */}
      <div className="relative overflow-hidden py-8" style={{ background: "linear-gradient(135deg, #0e0120, #1a0533)" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: "#FF0096" }} />
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-pink-500/20">
              <Star className="w-4.5 h-4.5 text-pink-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Gestión de Reseñas</h1>
              <p className="text-white/50 text-xs font-semibold">{reviews.length} reseñas registradas en total</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all hover:scale-102 cursor-pointer shadow-md"
            style={{ background: "linear-gradient(90deg, #FF0096, #9B00CC)" }}
          >
            <Plus className="w-4 h-4" />
            <span>+ Agregar Reseña Animada al Home</span>
          </button>
        </div>
      </div>

      <AdminTabBar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-amber-500 fill-current" />
              <span className="text-xs font-bold text-gray-400">Promedio general</span>
            </div>
            <p className="text-2xl font-black text-gray-900">{avgRating.toFixed(1)}</p>
            <div className="mt-1"><StarRating rating={Math.round(avgRating)} /></div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <ThumbsUp className="w-4 h-4 text-green-500" />
              <span className="text-xs font-bold text-gray-400">Positivas (4-5 ⭐)</span>
            </div>
            <p className="text-2xl font-black text-green-600">{positive}</p>
            <p className="text-[10px] text-gray-400 font-semibold mt-1">
              {reviews.length > 0 ? Math.round((positive / reviews.length) * 100) : 0}% del total
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <ThumbsDown className="w-4 h-4 text-red-500" />
              <span className="text-xs font-bold text-gray-400">Negativas (1-2 ⭐)</span>
            </div>
            <p className="text-2xl font-black text-red-500">{negative}</p>
            <p className="text-[10px] text-gray-400 font-semibold mt-1">
              {reviews.length > 0 ? Math.round((negative / reviews.length) * 100) : 0}% del total
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Distribución</p>
            <div className="space-y-1.5">
              {byRating.map(({ n, count, pct }) => (
                <div key={n} className="flex items-center gap-2 text-[10px] font-bold">
                  <span className="w-3 text-right text-gray-550">{n}</span>
                  <Star className="w-3 h-3 text-amber-400 shrink-0 fill-current" />
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-gray-400 w-3">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterRating(0)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${filterRating === 0 ? "text-white bg-slate-900 border-transparent" : "bg-white text-gray-600 border-gray-200"}`}
            >
              Todas ({reviews.length})
            </button>
            {[5, 4, 3, 2, 1].map(n => (
              <button
                key={n}
                onClick={() => setFilterRating(n)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all flex items-center gap-1 ${filterRating === n ? "text-white bg-amber-500 border-transparent" : "bg-white text-gray-600 border-gray-200"}`}
              >
                {n} <Star className="w-3 h-3 fill-current" style={{ color: filterRating === n ? "white" : "#F59E0B" }} />
                ({reviews.filter(r => r.rating === n).length})
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Buscar comentario..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-pink-500 font-semibold"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Reviews list */}
        {loading ? (
          <div className="py-20 text-center text-gray-400 text-xs font-bold">Cargando reseñas...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl py-20 text-center shadow-xs">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-400 text-xs font-bold">No hay reseñas encontradas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((r: any) => {
              const ratingColor = r.rating >= 4 ? "#22C55E" : r.rating === 3 ? "#F59E0B" : "#EF4444";
              const ratingBg = r.rating >= 4 ? "#F0FDF4" : r.rating === 3 ? "#FFFBEB" : "#FEF2F2";
              const deleting = confirmDelete === r.id;
              return (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 relative overflow-hidden flex flex-col justify-between">
                  <div
                    className="absolute top-0 left-0 w-1.5 h-full"
                    style={{ background: ratingColor }}
                  />

                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800">Usuario #{String(r.userId || r.id).slice(-6)}</p>
                          <p className="text-[10px] text-gray-450 font-semibold flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3" /> Est. #{r.establishmentId}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StarRating rating={r.rating} />
                        {!deleting ? (
                          <button
                            onClick={() => setConfirmDelete(r.id)}
                            className="text-slate-300 hover:text-red-650 transition-colors cursor-pointer w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-50"
                            title="Eliminar reseña"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 bg-red-50 border border-red-200 p-0.5 rounded-lg">
                            <button
                              className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold cursor-pointer"
                              onClick={() => deleteReview.mutate(r.id)}
                              disabled={deleteReview.isPending}
                            >
                              Sí
                            </button>
                            <button
                              className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                              onClick={() => setConfirmDelete(null)}
                            >
                              No
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {r.comment ? (
                      <p className="text-xs text-gray-600 font-semibold leading-relaxed pl-2 border-l border-gray-200 py-0.5">{r.comment}</p>
                    ) : (
                      <p className="text-xs text-gray-400 italic font-semibold">Sin comentario escrito</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[10px] text-gray-400 font-semibold">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString("es-VE", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                    </span>
                    {r.rating <= 2 && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-red-50 text-red-600 border border-red-200 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Negativa
                      </span>
                    )}
                    {r.rating === 5 && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-green-50 text-green-700 border border-green-200">
                        ⭐ Excelente
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00C8D4]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Modal Agregar Reseña Animada */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl relative border border-slate-200 animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold bg-[#FF0096]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Agregar Reseña Animada al Home</h3>
                <p className="text-xs text-slate-400 font-medium">Esta reseña aparecerá en las 3 filas animadas de la página principal.</p>
              </div>
            </div>

            <form onSubmit={handleAddFeaturedReview} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Nombre del Turista / Usuario *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Mariana Silva"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#FF0096]"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Hotel o Destino Visitado *</label>
                <input
                  type="text"
                  placeholder="Ej. Posada Galápagos · Los Roques"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#FF0096]"
                  value={newLocationTag}
                  onChange={e => setNewLocationTag(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Fila de Animación en la Marquesina</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#FF0096] cursor-pointer"
                  value={newRowPos}
                  onChange={e => setNewRowPos(Number(e.target.value))}
                >
                  <option value={1}>Fila 1 (Movimiento a la DERECHA ➡️)</option>
                  <option value={2}>Fila 2 (Movimiento a la IZQUIERDA ⬅️)</option>
                  <option value={3}>Fila 3 (Movimiento a la DERECHA ➡️)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Comentario del Viajero *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Escribe la reseña o testimonio..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#FF0096] resize-none"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-white text-xs font-bold shadow-md cursor-pointer hover:scale-102 transition-transform"
                  style={{ background: "linear-gradient(90deg, #FF0096, #9B00CC)" }}
                >
                  ✨ Publicar en Marquesina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
