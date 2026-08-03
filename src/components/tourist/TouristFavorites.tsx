import React, { useState } from "react";
import { Link } from "wouter";
import { 
  Heart, 
  MapPin, 
  Star, 
  Trash2, 
  MessageSquare, 
  ExternalLink, 
  Edit3, 
  Check, 
  Building2,
  Sparkles,
  Phone,
  Tag
} from "lucide-react";

export interface FavoriteHotel {
  id: string | number;
  slug: string;
  name: string;
  location: string;
  image: string;
  rating: number;
  priceLevel: string;
  category: string;
  whatsapp?: string;
  personalNotes?: string;
}

interface TouristFavoritesProps {
  favorites: FavoriteHotel[];
  onRemoveFavorite: (id: string | number) => void;
  onUpdateNote: (id: string | number, note: string) => void;
}

export function TouristFavorites({
  favorites,
  onRemoveFavorite,
  onUpdateNote
}: TouristFavoritesProps) {
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [tempNote, setTempNote] = useState("");
  const [filterQuery, setFilterQuery] = useState("");

  const handleStartEdit = (hotel: FavoriteHotel) => {
    setEditingId(hotel.id);
    setTempNote(hotel.personalNotes || "");
  };

  const handleSaveNote = (id: string | number) => {
    onUpdateNote(id, tempNote);
    setEditingId(null);
  };

  const filtered = favorites.filter(h => 
    h.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    h.location.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF0096] flex items-center justify-center text-white shadow-md shadow-[#FF0096]/20">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-slate-900">Panel de Fichas Preferidas</h2>
            <p className="text-xs text-slate-500">Tus hoteles y posadas favoritas guardadas con notas personales para tu próxima escapada.</p>
          </div>
        </div>

        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Buscar en mis preferidos..."
            value={filterQuery}
            onChange={e => setFilterQuery(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#FF0096]"
          />
        </div>
      </div>

      {/* Grid de Fichas Preferidas */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-xs">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#FF0096]/10 text-[#FF0096] flex items-center justify-center">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-serif mb-1">No tienes fichas preferidas guardadas</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Explora el catálogo de posadas y hoteles en Venezuela y haz clic en el corazón para agregarlos a tu panel personal.
          </p>
          <Link
            href="/establecimientos"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00C8D4] to-[#FF0096] text-white text-xs font-black uppercase tracking-wider shadow-md hover:scale-105 transition-all"
          >
            <Building2 className="w-4 h-4" />
            Explorar Establecimientos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(hotel => {
            const isEditing = editingId === hotel.id;
            const waNumber = (hotel.whatsapp || "+584120000000").replace(/[^0-9]/g, "");
            const waMsg = encodeURIComponent(`¡Hola! Vi la ficha de ${hotel.name} en Hoteles de Venezuela y deseo consultar disponibilidad.`);

            return (
              <div
                key={hotel.id}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Foto con overlays */}
                  <div className="relative h-44 overflow-hidden bg-slate-900">
                    <img
                      src={hotel.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    
                    {/* Badge Categoría */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-white/90 backdrop-blur-md text-slate-900 shadow-xs flex items-center gap-1">
                      <Tag className="w-3 h-3 text-[#FF0096]" />
                      {hotel.category || "Hotel / Posada"}
                    </span>

                    {/* Botón Quitar Favorito */}
                    <button
                      onClick={() => onRemoveFavorite(hotel.id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-950/60 backdrop-blur-md text-red-400 hover:text-red-500 hover:bg-white transition-all flex items-center justify-center shadow-xs cursor-pointer"
                      title="Quitar de preferidos"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Ubicación y Valoración sobre foto */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="flex items-center gap-1 font-medium drop-shadow-sm text-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-[#00C8D4]" />
                        {hotel.location}
                      </span>
                      <span className="flex items-center gap-1 bg-[#00C8D4] text-slate-950 px-2 py-0.5 rounded-md font-bold text-[11px]">
                        <Star className="w-3 h-3 fill-current" />
                        {hotel.rating || 4.9}
                      </span>
                    </div>
                  </div>

                  {/* Cuerpo de la Ficha */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif font-bold text-base text-slate-900 group-hover:text-[#00C8D4] transition-colors leading-tight">
                        {hotel.name}
                      </h3>
                      <span className="text-xs font-black text-[#9B00CC] shrink-0">{hotel.priceLevel || "$$"}</span>
                    </div>

                    {/* Sección de Notas Personales del Turista */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold mb-1">
                        <span className="flex items-center gap-1 text-[#FF0096]">
                          <Sparkles className="w-3 h-3" />
                          Mi Nota Personal:
                        </span>
                        {!isEditing && (
                          <button
                            onClick={() => handleStartEdit(hotel)}
                            className="text-slate-400 hover:text-slate-700 flex items-center gap-0.5 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            Editar
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="space-y-2 mt-1">
                          <textarea
                            value={tempNote}
                            onChange={e => setTempNote(e.target.value)}
                            placeholder="Añade un recordatorio o preferencia para este hotel..."
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#FF0096]"
                            rows={2}
                          />
                          <button
                            onClick={() => handleSaveNote(hotel.id)}
                            className="px-3 py-1 rounded-lg bg-[#FF0096] text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            Guardar Nota
                          </button>
                        </div>
                      ) : (
                        <p className="text-slate-600 italic">
                          {hotel.personalNotes || "Sin notas aún. Haz clic en editar para agregar un recordatorio."}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer de Acciones Directas */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2">
                  <a
                    href={`https://wa.me/${waNumber}?text=${waMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5 fill-current" />
                    Reservar WhatsApp
                  </a>

                  <Link
                    href={`/establecimiento/${hotel.slug}`}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-[#00C8D4] hover:text-[#00C8D4] transition-all"
                    title="Ver ficha completa"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
