import React, { useState } from "react";
import {
  Image as ImageIcon, Plus, Trash2, Tag, Calendar, MapPin, Camera,
  Share2, Eye, X, Upload, Sparkles, Filter, Info, SunMedium, PhoneCall
} from "lucide-react";
import type { CreatorGalleryAlbum, CreatorGalleryItem } from "../../types/creatorInfluencer";

interface CreatorTravelGalleryProps {
  albums: CreatorGalleryAlbum[];
  creatorName: string;
  onAddAlbum: (album: Partial<CreatorGalleryAlbum>) => CreatorGalleryAlbum;
  onUpdateAlbum: (albumId: string, updates: Partial<CreatorGalleryAlbum>) => void;
  onDeleteAlbum: (albumId: string) => void;
  onAddPhoto: (albumId: string, photo: Partial<CreatorGalleryItem>) => void;
  onDeletePhoto: (albumId: string, photoId: string) => void;
}

export const CreatorTravelGallery: React.FC<CreatorTravelGalleryProps> = ({
  albums,
  creatorName,
  onAddAlbum,
  onUpdateAlbum,
  onDeleteAlbum,
  onAddPhoto,
  onDeletePhoto
}) => {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>(albums[0]?.id || "");
  const [selectedTag, setSelectedTag] = useState<string>("todos");
  const [isNewAlbumModalOpen, setIsNewAlbumModalOpen] = useState(false);
  const [isAddPhotoModalOpen, setIsAddPhotoModalOpen] = useState(false);
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<CreatorGalleryItem | null>(null);

  // New Album form state
  const [newAlbumTitle, setNewAlbumTitle] = useState("");
  const [newAlbumDest, setNewAlbumDest] = useState("");
  const [newAlbumDate, setNewAlbumDate] = useState(new Date().toISOString().split("T")[0]);
  const [newAlbumCover, setNewAlbumCover] = useState("");
  const [newAlbumNotes, setNewAlbumNotes] = useState("");
  const [newAlbumHours, setNewAlbumHours] = useState("07:00 AM - 09:30 AM");
  const [newAlbumContacts, setNewAlbumContacts] = useState("");

  // New Photo form state
  const [newPhotoTitle, setNewPhotoTitle] = useState("");
  const [newPhotoCaption, setNewPhotoCaption] = useState("");
  const [newPhotoTag, setNewPhotoTag] = useState<any>("drone");
  const [newPhotoUrl, setNewPhotoUrl] = useState("");

  const currentAlbum = albums.find(a => a.id === selectedAlbumId) || albums[0];

  const handleCreateAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumTitle || !newAlbumDest) return;

    const created = onAddAlbum({
      title: newAlbumTitle,
      destination: newAlbumDest,
      trip_date: newAlbumDate,
      cover_url: newAlbumCover || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      notes_for_future_trips: newAlbumNotes,
      best_lighting_hours: newAlbumHours,
      local_contacts: newAlbumContacts,
      tags: ["paisaje", "drone"],
      photos: []
    });

    setSelectedAlbumId(created.id);
    setIsNewAlbumModalOpen(false);
    setNewAlbumTitle("");
    setNewAlbumDest("");
    setNewAlbumCover("");
    setNewAlbumNotes("");
    setNewAlbumContacts("");
  };

  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAlbum || !newPhotoUrl) return;

    onAddPhoto(currentAlbum.id, {
      photo_url: newPhotoUrl,
      title: newPhotoTitle || "Foto de Expedición",
      caption: newPhotoCaption,
      tag: newPhotoTag
    });

    setIsAddPhotoModalOpen(false);
    setNewPhotoTitle("");
    setNewPhotoCaption("");
    setNewPhotoUrl("");
  };

  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isAlbumCover: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (isAlbumCover) {
          setNewAlbumCover(result);
        } else {
          setNewPhotoUrl(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredPhotos = currentAlbum?.photos.filter(p => {
    if (selectedTag === "todos") return true;
    return p.tag === selectedTag;
  }) || [];

  const handleShareAlbumWhatsapp = (album: CreatorGalleryAlbum) => {
    const text = `📸 *Bitácora de Expedición HDV · ${album.title}*\n` +
      `📍 *Destino:* ${album.destination}\n` +
      `📅 *Fecha:* ${album.trip_date}\n` +
      `🌄 *Mejor hora de luz:* ${album.best_lighting_hours || 'N/A'}\n` +
      `📝 *Notas operativas:* ${album.notes_for_future_trips || 'Sin notas'}\n` +
      `📞 *Contactos:* ${album.local_contacts || 'N/A'}\n\n` +
      `✨ Registrado en el Panel de Creadora Hoteles de Venezuela`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1a0533] via-[#0e011f] to-[#1a0533] border border-[#00C8D4]/30 p-5 sm:p-6 shadow-2xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-[#00C8D4]/20 border border-[#00C8D4]/40 text-[#00C8D4] text-[10px] font-black uppercase tracking-wider">
              Bitácora Visual & Referencia Operativa
            </span>
            <span className="text-xs text-slate-400 font-semibold">• {albums.length} Expediciones</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-serif mt-1">
            Galería de Viajes & Memoria de Producción
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Álbumes fotográficos, mejores horas de iluminación para vuelo de drones, notas operativas de carretera y contactos de lancheros/guías para recordar cada viaje.
          </p>
        </div>

        <button
          onClick={() => setIsNewAlbumModalOpen(true)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF0096] to-[#00C8D4] hover:opacity-90 text-white font-black text-xs shadow-lg shadow-[#FF0096]/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Expedición</span>
        </button>
      </div>

      {/* Album Selector Tabs (Horizontal Scrollable) */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {albums.map(alb => {
          const isSelected = alb.id === currentAlbum?.id;
          return (
            <button
              key={alb.id}
              onClick={() => setSelectedAlbumId(alb.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                isSelected
                  ? "bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white border-white/40 shadow-md ring-2 ring-white/20 font-black"
                  : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-white/10"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-cyan-300" />
              <span>{alb.title}</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-black/40 text-white font-mono">
                {alb.photos.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Current Album Details Card */}
      {currentAlbum && (
        <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-5 sm:p-6 shadow-xl backdrop-blur-md space-y-6">
          
          {/* Top Info Strip */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-5 border-b border-white/10">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg sm:text-xl font-bold font-serif text-white">{currentAlbum.title}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {currentAlbum.destination}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {currentAlbum.trip_date}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              <button
                onClick={() => handleShareAlbumWhatsapp(currentAlbum)}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartir Bitácora</span>
              </button>

              <button
                onClick={() => setIsAddPhotoModalOpen(true)}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] hover:opacity-90 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>+ Cargar Foto</span>
              </button>

              {albums.length > 1 && (
                <button
                  onClick={() => {
                    if (confirm("¿Segura que deseas eliminar este álbum de expedición?")) {
                      onDeleteAlbum(currentAlbum.id);
                    }
                  }}
                  className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 transition-all cursor-pointer flex items-center justify-center"
                  title="Eliminar Expedición"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Operational Reference Cards (Memoria del Viaje) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* 1. Notas de Carretera / Tips */}
            <div className="p-4 rounded-2xl bg-[#0e011f]/90 border border-white/10 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-300 text-xs font-black uppercase tracking-wider">
                <Info className="w-3.5 h-3.5" />
                <span>Notas Operativas de Producción</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentAlbum.notes_for_future_trips || "Sin notas adicionales registradas para este viaje."}
              </p>
            </div>

            {/* 2. Horas de Iluminación & Drone */}
            <div className="p-4 rounded-2xl bg-[#0e011f]/90 border border-white/10 space-y-1.5">
              <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-black uppercase tracking-wider">
                <SunMedium className="w-3.5 h-3.5" />
                <span>Mejores Horas de Luz & Vuelo</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {currentAlbum.best_lighting_hours || "07:30 AM - 09:45 AM (Golden Hour)"}
              </p>
            </div>

            {/* 3. Contactos Locales / Lancheros */}
            <div className="p-4 rounded-2xl bg-[#0e011f]/90 border border-white/10 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-black uppercase tracking-wider">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Contactos Clave de Ruta</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentAlbum.local_contacts || "Guías y lancheros locales de confianza."}
              </p>
            </div>

          </div>

          {/* Tags Filter Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3 text-[#FF0096]" /> Filtrar:
            </span>
            {[
              { id: "todos", label: "Todas las Fotos" },
              { id: "drone", label: "🛸 Drone 4K" },
              { id: "hospedaje", label: "🏡 Hospedajes" },
              { id: "gastronomia", label: "🍤 Gastronomía" },
              { id: "4x4", label: "🚙 4x4 Off-Road" },
              { id: "paisaje", label: "🌄 Paisajes" }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTag(t.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedTag === t.id
                    ? "bg-[#00C8D4] text-slate-950 font-black"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Photos Grid */}
          {filteredPhotos.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-2xl bg-slate-950/30">
              <Camera className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-300">Aún no has cargado fotos para este filtro</p>
              <p className="text-xs text-slate-500 mt-1">Toma fotos en sitio o súbelas desde la galería de tu celular.</p>
              <button
                onClick={() => setIsAddPhotoModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-[#FF0096] text-white text-xs font-bold cursor-pointer"
              >
                + Subir Primera Foto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredPhotos.map(photo => (
                <div
                  key={photo.id}
                  className="group relative aspect-4/3 rounded-2xl overflow-hidden border border-white/10 bg-slate-950 shadow-md hover:border-[#00C8D4] transition-all"
                >
                  <img
                    src={photo.photo_url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => setActiveLightboxPhoto(photo)}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between pointer-events-none">
                    <div className="flex justify-between items-start pointer-events-auto">
                      {photo.tag && (
                        <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-black uppercase text-[#00C8D4] border border-[#00C8D4]/30">
                          {photo.tag}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePhoto(currentAlbum.id, photo.id);
                        }}
                        className="p-1 rounded-lg bg-black/60 hover:bg-red-600 text-slate-300 hover:text-white transition-all cursor-pointer"
                        title="Eliminar Foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="pointer-events-auto cursor-pointer" onClick={() => setActiveLightboxPhoto(photo)}>
                      <p className="text-xs font-bold text-white truncate leading-tight">{photo.title}</p>
                      {photo.caption && (
                        <p className="text-[10px] text-slate-300 truncate mt-0.5">{photo.caption}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* Modal Nueva Expedición */}
      {isNewAlbumModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#0e011f] border border-[#FF0096]/40 rounded-3xl p-6 shadow-2xl text-slate-100 my-auto space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold font-serif text-white">Nueva Expedición / Álbum</h3>
              <button onClick={() => setIsNewAlbumModalOpen(false)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAlbum} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Título del Viaje</label>
                <input
                  type="text"
                  placeholder="ej. Expedición Los Roques & Cayo de Agua"
                  value={newAlbumTitle}
                  onChange={e => setNewAlbumTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF0096]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Destino</label>
                  <input
                    type="text"
                    placeholder="Los Roques, Venezuela"
                    value={newAlbumDest}
                    onChange={e => setNewAlbumDest(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00C8D4]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={newAlbumDate}
                    onChange={e => setNewAlbumDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00C8D4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Foto de Portada</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="URL de imagen o carga archivo..."
                    value={newAlbumCover}
                    onChange={e => setNewAlbumCover(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF0096]"
                  />
                  <label className="px-3 py-2 rounded-xl bg-[#FF0096]/20 hover:bg-[#FF0096]/30 border border-[#FF0096]/40 text-[#FF0096] text-xs font-bold cursor-pointer transition-all flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir</span>
                    <input type="file" accept="image/*" onChange={e => handlePhotoFileUpload(e, true)} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Notas de Producción / Tips</label>
                <textarea
                  rows={2}
                  placeholder="Mejores spots de tomas aéreas, precauciones de marea, etc."
                  value={newAlbumNotes}
                  onChange={e => setNewAlbumNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF0096] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Horas de Luz Óptimas</label>
                  <input
                    type="text"
                    placeholder="07:30 AM - 09:30 AM"
                    value={newAlbumHours}
                    onChange={e => setNewAlbumHours(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Contactos Locales</label>
                  <input
                    type="text"
                    placeholder="Lanchero / Guía"
                    value={newAlbumContacts}
                    onChange={e => setNewAlbumContacts(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewAlbumModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#00C8D4] text-white text-xs font-black shadow-md cursor-pointer"
                >
                  Crear Álbum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cargar Foto */}
      {isAddPhotoModalOpen && currentAlbum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-md bg-[#0e011f] border border-[#00C8D4]/40 rounded-3xl p-6 shadow-2xl text-slate-100 my-auto space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold font-serif text-white">Cargar Foto a {currentAlbum.title}</h3>
              <button onClick={() => setIsAddPhotoModalOpen(false)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPhotoSubmit} className="space-y-3.5">
              
              {/* Photo Input (Camera or file) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Imagen / Captura con Cámara</label>
                
                {newPhotoUrl ? (
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-[#00C8D4] mb-2 bg-black">
                    <img src={newPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setNewPhotoUrl("")}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border-2 border-dashed border-white/20 bg-slate-900/60 text-center space-y-3">
                    <Camera className="w-8 h-8 text-[#00C8D4] mx-auto" />
                    <div className="flex justify-center gap-2">
                      <label className="px-4 py-2 rounded-xl bg-[#00C8D4] text-slate-950 font-black text-xs cursor-pointer shadow-md flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5" />
                        <span>Tomar Foto con Cámara</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={e => handlePhotoFileUpload(e, false)}
                          className="hidden"
                        />
                      </label>
                      <label className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer border border-white/10 flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Galería</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handlePhotoFileUpload(e, false)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Título de la Foto</label>
                <input
                  type="text"
                  placeholder="ej. Vista Aérea Cayo Sombrero"
                  value={newPhotoTitle}
                  onChange={e => setNewPhotoTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00C8D4]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Categoría / Tag</label>
                <select
                  value={newPhotoTag}
                  onChange={e => setNewPhotoTag(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00C8D4]"
                >
                  <option value="drone">🛸 Drone 4K & Aéreas</option>
                  <option value="hospedaje">🏡 Hospedaje / Suites</option>
                  <option value="gastronomia">🍤 Gastronomía & Coctelería</option>
                  <option value="4x4">🚙 4x4 Off-Road & Rutas</option>
                  <option value="paisaje">🌄 Paisajes & Atardeceres</option>
                  <option value="detras_camara">🎬 Detrás de Cámaras</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Descripción / Anécdota (Opcional)</label>
                <input
                  type="text"
                  placeholder="ej. Ajuste de filtro ND16 a las 8:30 AM"
                  value={newPhotoCaption}
                  onChange={e => setNewPhotoCaption(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPhotoModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newPhotoUrl}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] text-white text-xs font-black shadow-md cursor-pointer disabled:opacity-50"
                >
                  Guardar Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {activeLightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
          onClick={() => setActiveLightboxPhoto(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center space-y-3" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setActiveLightboxPhoto(null)}
              className="absolute -top-10 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="rounded-3xl overflow-hidden border border-white/20 shadow-2xl max-h-[75vh] w-full flex items-center justify-center bg-black">
              <img src={activeLightboxPhoto.photo_url} alt={activeLightboxPhoto.title} className="max-h-[75vh] w-auto object-contain rounded-2xl" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-white">{activeLightboxPhoto.title}</h4>
              {activeLightboxPhoto.caption && (
                <p className="text-xs text-slate-300">{activeLightboxPhoto.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
