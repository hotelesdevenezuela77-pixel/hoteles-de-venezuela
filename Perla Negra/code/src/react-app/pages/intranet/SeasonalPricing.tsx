import { useState, useEffect } from "react";
import { Plus, X, Calendar, DollarSign, Edit2, Trash2, Check, ToggleLeft, ToggleRight } from "lucide-react";

interface SeasonPrice {
  id: number;
  room_type: string;
  season_name: string;
  start_date: string;
  end_date: string;
  price_per_night: number;
  is_active: number;
  created_at: string;
}

const ROOM_TYPES = [
  { value: "Familiar", label: "Familiar (4 personas)", color: "bg-amber-100 text-amber-700" },
  { value: "Familiar Grande", label: "Familiar Grande (6 personas)", color: "bg-blue-100 text-blue-700" },
  { value: "Extrafamiliar", label: "Extrafamiliar (8 personas)", color: "bg-emerald-100 text-emerald-700" },
  { value: "Ejecutiva", label: "Ejecutiva (2 personas)", color: "bg-pink-100 text-pink-700" },
];

const SEASON_PRESETS = [
  { name: "Temporada Alta", start: "12-15", end: "01-15" },
  { name: "Semana Santa", start: "03-20", end: "04-10" },
  { name: "Carnaval", start: "02-01", end: "02-28" },
  { name: "Vacaciones Escolares", start: "07-15", end: "09-15" },
  { name: "Temporada Baja", start: "02-01", end: "06-30" },
];

export default function SeasonalPricing() {
  const [prices, setPrices] = useState<SeasonPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    room_type: "Familiar",
    season_name: "",
    start_date: "",
    end_date: "",
    price_per_night: "",
  });

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pricing");
      if (res.ok) {
        const data = await res.json();
        setPrices(data);
      }
    } catch (error) {
      console.error("Error fetching prices:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      room_type: "Familiar",
      season_name: "",
      start_date: "",
      end_date: "",
      price_per_night: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/pricing/${editingId}` : "/api/pricing";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price_per_night: parseFloat(formData.price_per_night),
          is_active: true,
        }),
      });

      if (res.ok) {
        resetForm();
        fetchPrices();
      }
    } catch (error) {
      console.error("Error saving price:", error);
    }
  };

  const handleEdit = (price: SeasonPrice) => {
    setFormData({
      room_type: price.room_type,
      season_name: price.season_name,
      start_date: price.start_date,
      end_date: price.end_date,
      price_per_night: price.price_per_night.toString(),
    });
    setEditingId(price.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta tarifa?")) return;
    try {
      const res = await fetch(`/api/pricing/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchPrices();
      }
    } catch (error) {
      console.error("Error deleting price:", error);
    }
  };

  const toggleActive = async (price: SeasonPrice) => {
    try {
      const res = await fetch(`/api/pricing/${price.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...price,
          is_active: !price.is_active,
        }),
      });
      if (res.ok) {
        fetchPrices();
      }
    } catch (error) {
      console.error("Error toggling price:", error);
    }
  };

  const applyPreset = (preset: typeof SEASON_PRESETS[0]) => {
    const currentYear = new Date().getFullYear();
    // Handle seasons that cross year boundaries
    const startMonth = parseInt(preset.start.split("-")[0]);
    const startYear = preset.name === "Temporada Alta" && startMonth === 12 ? currentYear : currentYear;
    const endYear = preset.name === "Temporada Alta" ? currentYear + 1 : currentYear;

    setFormData({
      ...formData,
      season_name: preset.name,
      start_date: `${startYear}-${preset.start}`,
      end_date: `${endYear}-${preset.end}`,
    });
  };

  const groupedPrices = prices.reduce((acc, price) => {
    if (!acc[price.room_type]) {
      acc[price.room_type] = [];
    }
    acc[price.room_type].push(price);
    return acc;
  }, {} as Record<string, SeasonPrice[]>);

  const activeCount = prices.filter(p => p.is_active).length;
  const totalCount = prices.length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">Precios por Temporada</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">Define tarifas diferentes para cada época del año</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:opacity-90 transition-opacity w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Nueva Tarifa</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-700">{totalCount}</p>
            <p className="text-sm text-amber-600">Tarifas Configuradas</p>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-700">{activeCount}</p>
            <p className="text-sm text-emerald-600">Tarifas Activas</p>
          </div>
        </div>
      </div>

      {/* Prices by Room Type */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          Cargando...
        </div>
      ) : prices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">No hay tarifas configuradas</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Crear Primera Tarifa
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {ROOM_TYPES.map((roomType) => {
            const roomPrices = groupedPrices[roomType.value] || [];
            if (roomPrices.length === 0) return null;

            return (
              <div key={roomType.value} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className={`px-6 py-4 border-b border-slate-100 flex items-center gap-3 ${roomType.color.replace('text-', 'bg-').replace('-700', '-50')}`}>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${roomType.color}`}>
                    {roomType.label}
                  </span>
                  <span className="text-slate-500 text-sm">
                    {roomPrices.length} {roomPrices.length === 1 ? 'tarifa' : 'tarifas'}
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {roomPrices.map((price) => (
                    <div
                      key={price.id}
                      className={`p-4 hover:bg-slate-50 transition-colors ${!price.is_active ? 'opacity-50' : ''}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-800">{price.season_name}</h3>
                            {!price.is_active && (
                              <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-600 rounded">
                                Inactiva
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(price.start_date).toLocaleDateString("es-VE")} — {new Date(price.end_date).toLocaleDateString("es-VE")}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-amber-600">
                              ${price.price_per_night.toFixed(2)}
                            </p>
                            <p className="text-xs text-slate-400">por noche</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleActive(price)}
                              className={`p-2 rounded-lg transition-colors ${
                                price.is_active
                                  ? 'text-emerald-500 hover:bg-emerald-50'
                                  : 'text-slate-400 hover:bg-slate-100'
                              }`}
                              title={price.is_active ? 'Desactivar' : 'Activar'}
                            >
                              {price.is_active ? (
                                <ToggleRight className="w-5 h-5" />
                              ) : (
                                <ToggleLeft className="w-5 h-5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleEdit(price)}
                              className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(price.id)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">
                {editingId ? "Editar Tarifa" : "Nueva Tarifa"}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Season Presets */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Plantillas Rápidas
                </label>
                <div className="flex flex-wrap gap-2">
                  {SEASON_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="px-3 py-1 text-xs bg-slate-100 hover:bg-amber-100 hover:text-amber-700 text-slate-600 rounded-full transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipo de Habitación *
                </label>
                <select
                  value={formData.room_type}
                  onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                >
                  {ROOM_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre de Temporada *
                </label>
                <input
                  type="text"
                  value={formData.season_name}
                  onChange={(e) => setFormData({ ...formData, season_name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Ej: Temporada Alta, Carnaval, Semana Santa"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Fecha Inicio *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Fecha Fin *
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Precio por Noche (USD) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price_per_night}
                    onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  {editingId ? "Guardar Cambios" : "Crear Tarifa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer Credit */}
      <div className="text-center py-6 border-t border-slate-200 mt-8">
        <p className="text-slate-400 text-sm">
          Posada Perla Negra — <span className="font-semibold text-amber-600">18 años de experiencia</span>
        </p>
        <p className="text-slate-400 text-sm">
          Centro de Tucacas, Morrocoy — <span className="text-amber-600">Lugar Familiar</span>
        </p>
      </div>
    </div>
  );
}
