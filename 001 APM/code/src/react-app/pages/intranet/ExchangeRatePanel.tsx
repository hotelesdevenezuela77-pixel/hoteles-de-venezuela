import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Plus,
  Trash2,
  RefreshCw,
  History,
} from "lucide-react";

interface ExchangeRate {
  id: number;
  rate_date: string;
  currency_from: string;
  currency_to: string;
  rate: number;
  source: string | null;
  created_at: string;
}

export default function ExchangeRatePanel() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [newRate, setNewRate] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newSource, setNewSource] = useState("BCV");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const [ratesRes, currentRes] = await Promise.all([
        fetch("/api/finance/exchange-rates"),
        fetch("/api/finance/exchange-rate"),
      ]);
      
      if (ratesRes.ok) {
        const data = await ratesRes.json();
        setRates(data.rates || []);
      }
      
      if (currentRes.ok) {
        const data = await currentRes.json();
        setCurrentRate(data.rate);
      }
    } catch (error) {
      console.error("Error fetching rates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRate = async () => {
    if (!newRate || !newDate) return;
    
    setSaving(true);
    try {
      const res = await fetch("/api/finance/exchange-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rate_date: newDate,
          rate: parseFloat(newRate),
          source: newSource || null,
        }),
      });
      
      if (res.ok) {
        setNewRate("");
        setNewDate(new Date().toISOString().split("T")[0]);
        fetchRates();
      }
    } catch (error) {
      console.error("Error adding rate:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta tasa?")) return;
    
    try {
      const res = await fetch(`/api/finance/exchange-rates/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchRates();
      }
    } catch (error) {
      console.error("Error deleting rate:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("es-VE", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getRateChange = (index: number) => {
    if (index >= rates.length - 1) return null;
    const current = rates[index].rate;
    const previous = rates[index + 1].rate;
    const change = ((current - previous) / previous) * 100;
    return change;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tasa de Cambio</h1>
          <p className="text-slate-500">Gestión de tasas USD/Bs</p>
        </div>
        <button
          onClick={fetchRates}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Current Rate Card */}
      <div className="bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-cyan-100 text-sm">Tasa Actual USD/Bs</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-bold">
                {currentRate ? `Bs. ${currentRate.toLocaleString("es-VE", { minimumFractionDigits: 2 })}` : "No definida"}
              </span>
              <span className="text-cyan-200">= $1 USD</span>
            </div>
            {rates.length > 0 && (
              <p className="text-cyan-200 text-sm mt-2">
                Última actualización: {formatDate(rates[0].rate_date)}
                {rates[0].source && ` • Fuente: ${rates[0].source}`}
              </p>
            )}
          </div>
          <div className="p-4 bg-white/20 rounded-xl">
            <DollarSign className="w-10 h-10" />
          </div>
        </div>
      </div>

      {/* Add New Rate */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-cyan-500" />
          Registrar Nueva Tasa
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Fecha</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Tasa (Bs por $1)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Bs.</span>
              <input
                type="number"
                step="0.01"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Fuente</label>
            <select
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="BCV">BCV (Oficial)</option>
              <option value="Paralelo">Paralelo</option>
              <option value="Promedio">Promedio</option>
              <option value="Manual">Manual</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleAddRate}
              disabled={saving || !newRate}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg hover:from-cyan-600 hover:to-teal-600 transition-all disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Guardar
            </button>
          </div>
        </div>
      </div>

      {/* Rate History */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-500" />
            Historial de Tasas
          </h2>
        </div>
        
        {rates.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No hay tasas registradas</p>
            <p className="text-sm">Agrega la primera tasa arriba</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-slate-600 text-sm">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Fecha</th>
                  <th className="px-6 py-3 text-right font-medium">Tasa (Bs/$)</th>
                  <th className="px-6 py-3 text-center font-medium">Variación</th>
                  <th className="px-6 py-3 text-left font-medium">Fuente</th>
                  <th className="px-6 py-3 text-center font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rates.map((rate, index) => {
                  const change = getRateChange(index);
                  return (
                    <tr key={rate.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-slate-800">{formatDate(rate.rate_date)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-lg font-bold text-slate-800">
                          Bs. {rate.rate.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {change !== null ? (
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                            change > 0 
                              ? 'bg-red-100 text-red-600' 
                              : change < 0 
                                ? 'bg-green-100 text-green-600'
                                : 'bg-slate-100 text-slate-600'
                          }`}>
                            {change > 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : change < 0 ? (
                              <TrendingDown className="w-3 h-3" />
                            ) : null}
                            {change > 0 ? '+' : ''}{change.toFixed(2)}%
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-sm">
                          {rate.source || "Sin fuente"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(rate.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-cyan-100 rounded-lg">
            <DollarSign className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <p className="font-medium text-cyan-800">Conversión automática</p>
            <p className="text-sm text-cyan-600">
              La tasa más reciente se usa automáticamente para convertir montos entre USD y Bs en todos los paneles de finanzas.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 py-4">
        <p>Tecnología desarrollada por Webmasterpro Entertainment Corporation</p>
        <p>Smarth Eco Systems — Israel de Jesús</p>
      </div>
    </div>
  );
}
