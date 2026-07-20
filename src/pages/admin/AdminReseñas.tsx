import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { supabase } from "@/lib/supabase";
import type { FeaturedReview } from "@/lib/reviewsStore";
import {
  fetchAllFeaturedReviews,
  saveFeaturedReview,
  removeFeaturedReview,
  convertFileToBase64
} from "@/lib/reviewsStore";
import {
  Star, Trash2, Search, Building2, User, AlertTriangle,
  ThumbsUp, ThumbsDown, MessageSquare, Loader2, Plus, Sparkles, X,
  Edit, Upload, Camera, Pin, Layers, ArrowRight, ArrowLeft, CheckCircle2, RefreshCw
} from "lucide-react";

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const iconSize = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={iconSize}
          fill={i <= rating ? "#F59E0B" : "none"}
          stroke={i <= rating ? "#F59E0B" : "#D1D5DB"}
        />
      ))}
      <span className="ml-1 text-xs font-bold text-slate-700">{rating}.0</span>
    </div>
  );
}

export function AdminReseñas() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState<"featured" | "general">("featured");
  const [search, setSearch] = useState("");
  const [filterRating, setFilterRating] = useState<number>(0);
  const [filterRow, setFilterRow] = useState<number>(0);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | number | null>(null);

  // Home Featured Reviews State
  const [featuredReviews, setFeaturedReviews] = useState<FeaturedReview[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState<boolean>(true);

  // Modal State for Create / Edit Featured Review
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [userName, setUserName] = useState("");
  const [locationTag, setLocationTag] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [rowPosition, setRowPosition] = useState<1 | 2 | 3>(1);
  const [userAvatar, setUserAvatar] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [toastMsg, setToastMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerToast = (m: string) => {
    setToastMsg(m);
    setTimeout(() => setToastMsg(""), 3800);
  };

  // Cargar reseñas destacadas del Home
  const loadFeaturedReviews = async () => {
    setLoadingFeatured(true);
    const data = await fetchAllFeaturedReviews();
    setFeaturedReviews(data);
    setLoadingFeatured(false);
  };

  useEffect(() => {
    loadFeaturedReviews();
  }, []);

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      setLocation("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Query to fetch general establishment reviews
  const { data: generalReviews = [], isLoading: loadingGeneral } = useQuery<any[]>({
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
          user_name: r.user_name || r.userName || `Usuario #${String(r.id).slice(-4)}`,
          establishmentId: r.establishment_id || r.establishmentId,
          establishmentName: r.establishment_name || r.establishmentName || `Hospedaje #${r.establishment_id || r.establishmentId}`,
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
            { id: 101, user_name: "Mariana Silva", establishmentName: "Posada Galápagos · Los Roques", establishmentId: 2, rating: 5, comment: "Excelente posada, muy buena atención y comida riquísima.", createdAt: new Date().toISOString() },
            { id: 102, user_name: "Carlos Mendoza", establishmentName: "Hotel Eurobuilding · Caracas", establishmentId: 5, rating: 4, comment: "El servicio impecable, aunque el check-in demoró unos minutos.", createdAt: new Date().toISOString() },
          ];
          localStorage.setItem(localReviewKey, JSON.stringify(defaults));
          return defaults;
        }
        return localReviews;
      }
    },
    staleTime: 15000,
  });

  const deleteGeneralReview = useMutation({
    mutationFn: async (id: number) => {
      const localReviewKey = "hdv_mock_reviews";
      const localReviews = JSON.parse(localStorage.getItem(localReviewKey) || "[]");
      const isMock = localReviews.some((r: any) => r.id === id);

      if (isMock) {
        localStorage.setItem(localReviewKey, JSON.stringify(localReviews.filter((r: any) => r.id !== id)));
        return { success: true };
      }

      try {
        const { error } = await supabase.from("reviews").delete().eq("id", id);
        if (error) throw error;
      } catch (err) {
        localStorage.setItem(localReviewKey, JSON.stringify(localReviews.filter((r: any) => r.id !== id)));
      }
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      setConfirmDeleteId(null);
      triggerToast("Reseña eliminada correctamente.");
    },
  });

  // Abrir modal para crear nueva reseña fijada
  const openCreateModal = () => {
    setEditingId(null);
    setUserName("");
    setLocationTag("");
    setComment("");
    setRating(5);
    setRowPosition(1);
    setUserAvatar("");
    setShowModal(true);
  };

  // Abrir modal para editar reseña fijada existente
  const openEditModal = (review: FeaturedReview) => {
    setEditingId(review.id);
    setUserName(review.user_name);
    setLocationTag(review.location_tag);
    setComment(review.comment);
    setRating(review.rating || 5);
    setRowPosition(review.row_position || 1);
    setUserAvatar(review.user_avatar || "");
    setShowModal(true);
  };

  // Abrir modal para fijar una reseña general de hotel al Home
  const openPinToHomeModal = (genRev: any) => {
    setActiveTab("featured");
    setEditingId(null);
    setUserName(genRev.user_name || "Cliente Verificado");
    setLocationTag(genRev.establishmentName || "Hospedaje en Venezuela");
    setComment(genRev.comment || "");
    setRating(genRev.rating || 5);
    setRowPosition(1);
    setUserAvatar("");
    setShowModal(true);
  };

  // Manejador de la subida de foto real de cliente
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen es demasiado grande. El límite recomendado es de 5MB.");
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const base64Image = await convertFileToBase64(file);
      setUserAvatar(base64Image);
      triggerToast("📷 Foto de cliente cargada con éxito.");
    } catch (err) {
      alert("No se pudo cargar la imagen. Intenta nuevamente.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Guardar (crear o actualizar) reseña destacada
  const handleSubmitFeaturedReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !comment.trim()) {
      alert("Por favor ingresa al menos el nombre del cliente y el comentario.");
      return;
    }

    const reviewPayload: FeaturedReview = {
      id: editingId ? editingId : Date.now(),
      user_name: userName.trim(),
      location_tag: locationTag.trim() || "Venezuela",
      comment: comment.trim(),
      rating: rating,
      row_position: rowPosition,
      user_avatar: userAvatar.trim() || undefined,
      created_at: new Date().toISOString()
    };

    const updatedList = await saveFeaturedReview(reviewPayload);
    setFeaturedReviews(updatedList);
    setShowModal(false);

    if (editingId) {
      triggerToast("✨ Reseña del Home actualizada con éxito.");
    } else {
      triggerToast("✨ Nueva reseña animada fijada en el Home.");
    }
  };

  // Eliminar reseña fijada del Home
  const handleDeleteFeatured = async (id: string | number) => {
    const updatedList = await removeFeaturedReview(id);
    setFeaturedReviews(updatedList);
    setConfirmDeleteId(null);
    triggerToast("Reseña removida del Home.");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-[#FF0096] animate-spin" />
        <p className="text-slate-500 text-xs font-bold">Cargando panel de gestión de reseñas...</p>
      </div>
    );
  }

  // Filtrado de reseñas fijadas del home
  const filteredFeatured = featuredReviews.filter(r => {
    const matchRating = filterRating === 0 || r.rating === filterRating;
    const matchRow = filterRow === 0 || Number(r.row_position) === filterRow;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      r.user_name.toLowerCase().includes(q) ||
      r.location_tag.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q);
    return matchRating && matchRow && matchSearch;
  });

  // Filtrado de reseñas generales
  const filteredGeneral = generalReviews.filter(r => {
    const matchRating = filterRating === 0 || r.rating === filterRating;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (r.comment ?? "").toLowerCase().includes(q) ||
      (r.user_name ?? "").toLowerCase().includes(q) ||
      String(r.establishmentId).includes(q);
    return matchRating && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-24 font-sans">
      {/* Header Corporativo Oficial */}
      <div className="relative overflow-hidden py-9" style={{ background: "linear-gradient(135deg, #0e011f 0%, #1a0533 100%)" }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ background: "#FF0096" }} />
        <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ background: "#00C8D4" }} />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #FF0096, #9B00CC)" }}>
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">Módulo de Gestión de Reseñas</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#00C8D4]/20 text-[#00C8D4] border border-[#00C8D4]/30">
                  Home & Clientes
                </span>
              </div>
              <p className="text-white/60 text-xs font-semibold mt-0.5">
                Modera reseñas recibidas y gestiona las opiniones animadas fijadas en la página principal con fotos reales de clientes.
              </p>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white text-xs font-bold transition-all hover:scale-102 cursor-pointer shadow-lg active:scale-98"
            style={{ background: "linear-gradient(90deg, #FF0096, #9B00CC)" }}
          >
            <Plus className="w-4.5 h-4.5" />
            <span>+ Nueva Reseña Fijada con Foto</span>
          </button>
        </div>
      </div>

      <AdminTabBar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Pestañas de Selección (Fijadas en Home vs Generales) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab("featured")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "featured"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#FF0096]" />
              <span>Reseñas Fijadas en Home</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-pink-100 text-pink-700 font-black">
                {featuredReviews.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("general")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "general"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Building2 className="w-4 h-4 text-[#00C8D4]" />
              <span>Reseñas de Establecimientos</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-cyan-100 text-cyan-700 font-black">
                {generalReviews.length}
              </span>
            </button>
          </div>

          {/* Filtro por buscador y estrellas */}
          <div className="flex items-center gap-3 flex-wrap">
            {activeTab === "featured" && (
              <select
                value={filterRow}
                onChange={e => setFilterRow(Number(e.target.value))}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#FF0096] cursor-pointer shadow-2xs"
              >
                <option value={0}>Todas las Filas Marquee</option>
                <option value={1}>Fila 1 (➡️ Mov. Derecha)</option>
                <option value={2}>Fila 2 (⬅️ Mov. Izquierda)</option>
                <option value={3}>Fila 3 (➡️ Mov. Derecha)</option>
              </select>
            )}

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                placeholder={activeTab === "featured" ? "Buscar por turista o hotel..." : "Buscar comentario..."}
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-[#FF0096] font-semibold text-slate-800 shadow-2xs"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* CONTENIDO TAB 1: RESEÑAS FIJADAS DEL HOME */}
        {activeTab === "featured" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#FF0096]" />
                Estas opiniones se muestran en el banner infinito animado de 3 filas en la página de inicio.
              </p>
              <button
                onClick={loadFeaturedReviews}
                className="text-xs font-bold text-[#00C8D4] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Recargar lista
              </button>
            </div>

            {loadingFeatured ? (
              <div className="py-20 text-center text-slate-400 text-xs font-bold flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-[#FF0096] animate-spin" />
                <span>Cargando reseñas fijadas del home...</span>
              </div>
            ) : filteredFeatured.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center shadow-2xs p-6">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-600 text-sm font-bold">No se encontraron reseñas fijadas en este filtro</p>
                <button
                  onClick={openCreateModal}
                  className="mt-4 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-md cursor-pointer"
                  style={{ background: "linear-gradient(90deg, #FF0096, #9B00CC)" }}
                >
                  + Agregar primera reseña fijada
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFeatured.map((rev) => {
                  const isDeleting = confirmDeleteId === rev.id;
                  const rowBadgeColor = rev.row_position === 1 ? "bg-pink-50 text-pink-700 border-pink-200" : rev.row_position === 2 ? "bg-cyan-50 text-cyan-700 border-cyan-200" : "bg-purple-50 text-purple-700 border-purple-200";

                  return (
                    <div
                      key={rev.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between group"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF0096] to-[#00C8D4]" />

                      <div>
                        {/* Cabecera Tarjeta: Foto y Datos del Turista */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            {rev.user_avatar ? (
                              <img
                                src={rev.user_avatar}
                                alt={rev.user_name}
                                className="w-11 h-11 rounded-full object-cover border-2 border-pink-300 shadow-xs shrink-0"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-full text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0" style={{ background: "linear-gradient(135deg, #FF0096, #9B00CC)" }}>
                                {rev.user_name.charAt(0)}
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <h3 className="text-xs font-bold text-slate-900 truncate">{rev.user_name}</h3>
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#00C8D4] shrink-0" />
                              </div>
                              <p className="text-[11px] text-slate-500 font-semibold truncate mt-0.5">
                                {rev.location_tag}
                              </p>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border shrink-0 ${rowBadgeColor}`}>
                            Fila {rev.row_position} {rev.row_position === 2 ? "⬅️" : "➡️"}
                          </span>
                        </div>

                        {/* Puntuación */}
                        <div className="mb-2">
                          <StarRating rating={rev.rating || 5} />
                        </div>

                        {/* Comentario */}
                        <p className="text-xs text-slate-600 font-medium leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                          "{rev.comment}"
                        </p>
                      </div>

                      {/* Botones de Acción */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold">
                          {rev.user_avatar ? "📸 Foto Real Cliente" : "👤 Avatar Iniciales"}
                        </span>

                        <div className="flex items-center gap-2">
                          {!isDeleting ? (
                            <>
                              <button
                                onClick={() => openEditModal(rev)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5 text-[#FF0096]" />
                                <span>Editar</span>
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(rev.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Eliminar de la marquesina"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-1 bg-red-50 border border-red-200 px-2 py-1 rounded-xl">
                              <span className="text-[10px] font-bold text-red-600">¿Eliminar?</span>
                              <button
                                onClick={() => handleDeleteFeatured(rev.id)}
                                className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold cursor-pointer hover:bg-red-700"
                              >
                                Sí
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CONTENIDO TAB 2: RESEÑAS DE ESTABLECIMIENTOS */}
        {activeTab === "general" && (
          <div>
            <div className="mb-4">
              <p className="text-xs font-bold text-slate-500">
                Reseñas de viajeros enviadas directamente a posadas y hoteles desde sus fichas comerciales. Puedes fijarlas al Home con 1 clic.
              </p>
            </div>

            {loadingGeneral ? (
              <div className="py-20 text-center text-slate-400 text-xs font-bold">Cargando reseñas de hoteles...</div>
            ) : filteredGeneral.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center shadow-2xs">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500 text-xs font-bold">No hay reseñas registradas para hospedajes en este filtro</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGeneral.map((r: any) => {
                  const ratingColor = r.rating >= 4 ? "#22C55E" : r.rating === 3 ? "#F59E0B" : "#EF4444";
                  const deleting = confirmDeleteId === r.id;

                  return (
                    <div key={r.id} className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 relative overflow-hidden flex flex-col justify-between">
                      <div className="absolute top-0 left-0 w-1.5 h-full" style={{ background: ratingColor }} />

                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">
                              <User className="w-4 h-4 text-slate-500" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{r.user_name}</p>
                              <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                                <Building2 className="w-3 h-3 text-[#00C8D4]" /> {r.establishmentName}
                              </p>
                            </div>
                          </div>
                          <StarRating rating={r.rating} />
                        </div>

                        {r.comment ? (
                          <p className="text-xs text-slate-600 font-semibold leading-relaxed pl-2.5 border-l-2 border-slate-200 py-0.5">
                            "{r.comment}"
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400 italic font-semibold">Sin comentario escrito</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString("es-VE", { year: "numeric", month: "short", day: "numeric" }) : "Fecha no disp."}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openPinToHomeModal(r)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all cursor-pointer shadow-xs hover:scale-102"
                            style={{ background: "linear-gradient(90deg, #FF0096, #9B00CC)" }}
                            title="Fijar esta opinión en la marquesina animada del Home"
                          >
                            <Pin className="w-3.5 h-3.5" />
                            <span>📌 Fijar en Home</span>
                          </button>

                          {!deleting ? (
                            <button
                              onClick={() => setConfirmDeleteId(r.id)}
                              className="text-slate-300 hover:text-red-600 transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-slate-50"
                              title="Eliminar reseña"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <div className="flex items-center gap-1 bg-red-50 border border-red-200 p-1 rounded-lg">
                              <button
                                className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold cursor-pointer"
                                onClick={() => deleteGeneralReview.mutate(r.id)}
                                disabled={deleteGeneralReview.isPending}
                              >
                                Sí
                              </button>
                              <button
                                className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                                onClick={() => setConfirmDeleteId(null)}
                              >
                                No
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-[#00C8D4]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* MODAL CREAR / EDITAR RESEÑA DESTACADA DEL HOME */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-5 border-b border-slate-100 pb-4">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold shadow-md" style={{ background: "linear-gradient(135deg, #FF0096, #9B00CC)" }}>
                {editingId ? <Edit className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingId ? "Editar Reseña del Home" : "Agregar Reseña Animada al Home"}
                </h3>
                <p className="text-xs text-slate-400 font-semibold">
                  Aparecerá en el carrusel infinito del Home con la foto del cliente.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitFeaturedReview} className="space-y-4">
              {/* Carga de Foto Real del Cliente */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
                  Foto Real del Cliente / Turista (Recomendado)
                </label>
                
                <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  {userAvatar ? (
                    <div className="relative group shrink-0">
                      <img
                        src={userAvatar}
                        alt="Foto cliente"
                        className="w-14 h-14 rounded-full object-cover border-2 border-[#FF0096] shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setUserAvatar("")}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 cursor-pointer"
                        title="Quitar foto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-200 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0">
                      <Camera className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="w-full py-2 px-3 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-colors"
                    >
                      {isUploadingPhoto ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF0096]" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-[#FF0096]" />
                      )}
                      <span>{userAvatar ? "Cambiar Foto desde PC" : "Subir Foto enviada por Cliente"}</span>
                    </button>

                    <input
                      type="url"
                      placeholder="O pega una URL de foto (http...)"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none focus:border-[#FF0096]"
                      value={userAvatar}
                      onChange={e => setUserAvatar(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Nombre del Turista */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                  Nombre del Turista / Usuario *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Mariana Silva"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#FF0096] text-slate-800"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                />
              </div>

              {/* Hotel / Destino Visitado */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                  Hotel o Destino Visitado *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Posada Galápagos · Los Roques"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#FF0096] text-slate-800"
                  value={locationTag}
                  onChange={e => setLocationTag(e.target.value)}
                />
              </div>

              {/* Fila de Animación y Rating */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                    Fila de Animación en Home
                  </label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#FF0096] cursor-pointer"
                    value={rowPosition}
                    onChange={e => setRowPosition(Number(e.target.value) as 1 | 2 | 3)}
                  >
                    <option value={1}>Fila 1 (➡️ Derecha)</option>
                    <option value={2}>Fila 2 (⬅️ Izquierda)</option>
                    <option value={3}>Fila 3 (➡️ Derecha)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                    Puntuación (Calificación)
                  </label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#FF0096] cursor-pointer"
                    value={rating}
                    onChange={e => setRating(Number(e.target.value))}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5.0 Excelente)</option>
                    <option value={4}>⭐⭐⭐⭐ (4.0 Muy Bueno)</option>
                    <option value={3}>⭐⭐⭐ (3.0 Bueno)</option>
                    <option value={2}>⭐⭐ (2.0 Regular)</option>
                    <option value={1}>⭐ (1.0 Deficiente)</option>
                  </select>
                </div>
              </div>

              {/* Comentario */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                  Comentario / Testimonio del Turista *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Escribe el testimonio del cliente..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#FF0096] resize-none text-slate-800"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                />
              </div>

              {/* Botones del Modal */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-white text-xs font-bold shadow-md cursor-pointer hover:scale-102 transition-transform flex items-center justify-center gap-1.5"
                  style={{ background: "linear-gradient(90deg, #FF0096, #9B00CC)" }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{editingId ? "Guardar Cambios" : "✨ Publicar en Home"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
