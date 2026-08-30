import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/react-app/components/ui/select";
import { RefreshCw, DollarSign, TrendingUp, Calendar, History } from "lucide-react";

interface ExchangeRate {
  id: number;
  rate_date: string;
  rate: number;
  source: string;
  created_at: string;
}

const SOURCES = [
  { value: "bcv", label: "BCV (Oficial)" },
  { value: "paralelo", label: "Paralelo" },
  { value: "promedio", label: "Promedio" },
];

export default function ExchangeRateDashboard() {
  const queryClient = useQueryClient();
  const [newRate, setNewRate] = useState({
    rate_date: new Date().toISOString().split("T")[0],
    rate: "",
    source: "bcv",
  });

  const { data: rates = [], isLoading } = useQuery<ExchangeRate[]>({
    queryKey: ["exchange-rates"],
    queryFn: async () => {
      const res = await fetch("/api/exchange-rates");
      const data = await res.json();
      return data.rates || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (rateData: typeof newRate) => {
      const res = await fetch("/api/exchange-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rateData),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exchange-rates"] });
      setNewRate({
        rate_date: new Date().toISOString().split("T")[0],
        rate: "",
        source: "bcv",
      });
    },
  });

  const currentRate = rates.length > 0 ? rates[0] : null;

  const handleSubmit = () => {
    if (!newRate.rate || parseFloat(newRate.rate) <= 0) return;
    createMutation.mutate(newRate);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getSourceLabel = (source: string) => {
    return SOURCES.find((s) => s.value === source)?.label || source;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-luxury font-bold text-stone-800">Tasa de Cambio</h1>
          <p className="text-stone-500 font-cursive">Gestión de tasas USD/Bs</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["exchange-rates"] })}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </Button>
      </div>

      {/* Current Rate Card */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-6 mb-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-amber-100 text-sm mb-1">Tasa Actual USD/Bs</p>
            {currentRate ? (
              <>
                <p className="text-4xl font-bold">
                  Bs. {currentRate.rate.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-amber-200 text-sm mt-1">= $1 USD</p>
                <p className="text-amber-200 text-xs mt-2">
                  {getSourceLabel(currentRate.source)} • {formatDate(currentRate.rate_date)}
                </p>
              </>
            ) : (
              <>
                <p className="text-4xl font-bold">No definida</p>
                <p className="text-amber-200 text-sm mt-1">= $1 USD</p>
              </>
            )}
          </div>
          <div className="bg-white/20 rounded-full p-4">
            <DollarSign className="w-10 h-10" />
          </div>
        </div>
      </div>

      {/* Register New Rate */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-semibold text-stone-800">Registrar Nueva Tasa</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-sm text-stone-600 mb-1 block">Fecha</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input
                type="date"
                value={newRate.rate_date}
                onChange={(e) => setNewRate({ ...newRate, rate_date: e.target.value })}
                className="pl-10 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-stone-600 mb-1 block">Tasa (Bs por $1)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">Bs.</span>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={newRate.rate}
                onChange={(e) => setNewRate({ ...newRate, rate: e.target.value })}
                className="pl-10 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-stone-600 mb-1 block">Fuente</label>
            <Select value={newRate.source} onValueChange={(v) => setNewRate({ ...newRate, source: v })}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending || !newRate.rate}
            className="bg-amber-600 hover:bg-amber-700 text-white rounded-full"
          >
            + Guardar
          </Button>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-stone-600" />
          <h2 className="text-lg font-semibold text-stone-800">Historial de Tasas</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
          </div>
        ) : rates.length === 0 ? (
          <div className="text-center py-12 text-stone-400">
            <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay tasas registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-stone-600">Fecha</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-stone-600">Tasa (Bs/$1)</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-stone-600">Fuente</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-stone-600">Registrado</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((rate: ExchangeRate, idx: number) => (
                  <tr
                    key={rate.id}
                    className={`border-b border-stone-100 ${idx === 0 ? "bg-amber-50" : ""}`}
                  >
                    <td className="py-3 px-4 text-stone-800">{formatDate(rate.rate_date)}</td>
                    <td className="py-3 px-4 text-right font-semibold text-stone-800">
                      Bs. {rate.rate.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-stone-600">{getSourceLabel(rate.source)}</td>
                    <td className="py-3 px-4 text-stone-500 text-sm">
                      {new Date(rate.created_at).toLocaleString("es-VE")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
