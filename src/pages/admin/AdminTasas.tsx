import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { Repeat2, Edit2, Check, X, TrendingUp, Loader2, RefreshCw, DollarSign, Calendar, Sparkles } from "lucide-react";
import { getBcvExchangeRate, setBcvExchangeRateLocally, DEFAULT_BCV_RATE } from "@/hooks/useBcvExchangeRate";

const FUCSIA = "#FF0096";
const CIAN = "#00C8D4";
const PURPURA = "#9B00CC";

export function AdminTasas() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  
  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      setLocation("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Query to fetch exchange rates
  const { data: rates = [], isLoading: loading, refetch } = useQuery<any[]>({
    queryKey: ["exchange-rates"],
    queryFn: async () => {
      const currentBcv = getBcvExchangeRate();
      try {
        const { data, error } = await supabase
          .from("exchange_rates")
          .select("*")
          .order("id");
        if (error) throw error;

        const mapped = (data || []).map((r: any) => ({
          id: r.id,
          fromCurrency: r.from_currency || r.fromCurrency || "USD",
          toCurrency: r.to_currency || r.toCurrency || "VES",
          rate: (r.from_currency === "USD" || r.fromCurrency === "USD") && (r.to_currency === "VES" || r.toCurrency === "VES") 
            ? (r.rate || currentBcv) 
            : (r.rate || 1),
          source: r.source || "BCV Oficial",
          isActive: r.is_active !== undefined ? r.is_active : (r.isActive !== undefined ? r.isActive : true),
          updatedBy: r.updated_by || r.updatedBy || "Sistema",
          updatedAt: r.updated_at || r.updatedAt || new Date().toISOString()
        }));

        const localRatesKey = "hdv_mock_exchange_rates";
        const localRates = JSON.parse(localStorage.getItem(localRatesKey) || "[]");
        
        if (mapped.length === 0 && localRates.length === 0) {
          const defaults = [
            { id: 1, fromCurrency: "USD", toCurrency: "VES", rate: currentBcv || DEFAULT_BCV_RATE, source: "BCV Oficial", isActive: true, updatedBy: "Admin Master", updatedAt: new Date().toISOString() },
            { id: 2, fromCurrency: "USD", toCurrency: "COP", rate: 4100.00, source: "TRM Oficial", isActive: true, updatedBy: "System", updatedAt: new Date().toISOString() },
          ];
          localStorage.setItem(localRatesKey, JSON.stringify(defaults));
          return defaults;
        }

        return [...mapped, ...localRates];
      } catch (err) {
        const localRatesKey = "hdv_mock_exchange_rates";
        const localRates = JSON.parse(localStorage.getItem(localRatesKey) || "[]");
        if (localRates.length === 0) {
          const defaults = [
            { id: 1, fromCurrency: "USD", toCurrency: "VES", rate: currentBcv || DEFAULT_BCV_RATE, source: "BCV Oficial", isActive: true, updatedBy: "Admin Master", updatedAt: new Date().toISOString() },
            { id: 2, fromCurrency: "USD", toCurrency: "COP", rate: 4100.00, source: "TRM Oficial", isActive: true, updatedBy: "System", updatedAt: new Date().toISOString() },
          ];
          localStorage.setItem(localRatesKey, JSON.stringify(defaults));
          return defaults;
        }
        return localRates;
      }
    },
    staleTime: 5000,
  });

  const [editId, setEditId] = useState<number | null>(null);
  const [editRate, setEditRate] = useState("");
  const [editSource, setEditSource] = useState("");

  const update = useMutation({
    mutationFn: async ({ id, rate, source }: { id: number; rate: number; source: string }) => {
      const targetRateItem = rates.find((r: any) => r.id === id);
      const isUsdVes = targetRateItem && (targetRateItem.fromCurrency === "USD" || targetRateItem.from_currency === "USD") && (targetRateItem.toCurrency === "VES" || targetRateItem.to_currency === "VES");
      
      if (isUsdVes || id === 1) {
        setBcvExchangeRateLocally(rate, source || "BCV Oficial");
      }

      const localRatesKey = "hdv_mock_exchange_rates";
      const localRates = JSON.parse(localStorage.getItem(localRatesKey) || "[]");
      const isMock = localRates.some((r: any) => r.id === id);

      if (isMock) {
        const updated = localRates.map((r: any) => r.id === id ? { ...r, rate, source, updatedAt: new Date().toISOString() } : r);
        localStorage.setItem(localRatesKey, JSON.stringify(updated));
        return { success: true };
      }

      try {
        const { error } = await supabase
          .from("exchange_rates")
          .update({ rate, source, updated_at: new Date().toISOString() })
          .eq("id", id);
        if (error) throw error;
      } catch (err) {
        const updated = localRates.map((r: any) => r.id === id ? { ...r, rate, source, updatedAt: new Date().toISOString() } : r);
        localStorage.setItem(localRatesKey, JSON.stringify(updated));
      }
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exchange-rates"] });
      setEditId(null);
    },
  });

  const startEdit = (r: any) => {
    setEditId(r.id);
    setEditRate(String(r.rate));
    setEditSource(r.source || "");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0e011f] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-[#FF0096] animate-spin" />
        <p className="text-slate-400 text-xs font-bold">Verificando credenciales de seguridad...</p>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto text-slate-100 font-sans">
        
        {/* Cabecera Principal */}
        <div
          className="rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1a0533 0%, #0e011f 100%)" }}
        >
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ background: CIAN }} />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-10" style={{ background: FUCSIA }} />

          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-[#00C8D4]/15 text-[#00C8D4] border border-[#00C8D4]/30">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Matriz Monetaria Oficial · Hoteles de Venezuela</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-wide">
                Configuración de Tasas de Cambio
              </h1>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Administra la tasa oficial del dólar BCV y divisas de referencia. Cualquier cambio se sincroniza instantáneamente en los módulos de Honorarios ($20), Cotizaciones, Expediciones y Reservas de la plataforma.
              </p>
            </div>

            <button
              onClick={() => refetch()}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 flex items-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#00C8D4]" />
              <span>Sincronizar</span>
            </button>
          </div>
        </div>

        {/* Lista de Tasas */}
        {loading ? (
          <div className="space-y-3">
            {Array(2).fill(0).map((_, i) => (
              <div key={i} className="bg-white/5 rounded-3xl h-28 animate-pulse border border-white/10" />
            ))}
          </div>
        ) : rates.length === 0 ? (
          <div className="bg-white/5 rounded-3xl py-16 text-center border border-white/10">
            <Repeat2 className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400 text-xs font-bold">No hay tasas de cambio registradas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {rates.map(r => {
              const isUsdVes = (r.fromCurrency === "USD" || r.from_currency === "USD") && (r.toCurrency === "VES" || r.to_currency === "VES");

              return (
                <div
                  key={r.id}
                  className={`bg-[#1a0533]/80 backdrop-blur-md rounded-3xl border transition-all p-6 relative overflow-hidden ${
                    isUsdVes ? "border-[#00C8D4]/40 shadow-xl" : "border-white/10"
                  }`}
                >
                  {/* Pair header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/10 border border-white/10">
                        <span className="text-sm font-black text-white">{r.fromCurrency}</span>
                        <span className="text-slate-400 font-bold">→</span>
                        <span className="text-sm font-black text-[#00C8D4]">{r.toCurrency}</span>
                      </div>
                      {isUsdVes && (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Tasa Principal BCV
                        </span>
                      )}
                    </div>

                    {editId !== r.id && (
                      <button
                        onClick={() => startEdit(r)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white hover:scale-103 transition cursor-pointer"
                        style={{ background: `linear-gradient(135deg, ${FUCSIA} 0%, ${PURPURA} 100%)` }}
                      >
                        <Edit2 className="w-3 h-3" /> Editar Tasa
                      </button>
                    )}
                  </div>

                  {editId === r.id ? (
                    /* Edit mode */
                    <div className="space-y-4 pt-2 border-t border-white/10">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 block">
                            Tasa de Cambio *
                          </label>
                          <input
                            value={editRate}
                            onChange={e => setEditRate(e.target.value)}
                            type="number"
                            step="0.01"
                            className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#00C8D4] font-mono font-bold text-white"
                            autoFocus
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 block">
                            Fuente Oficial
                          </label>
                          <input
                            value={editSource}
                            onChange={e => setEditSource(e.target.value)}
                            placeholder="BCV Oficial..."
                            className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#00C8D4] font-semibold text-white"
                          />
                        </div>
                      </div>

                      {/* Vista previa de montos de prueba */}
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[11px] text-slate-300 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400">$20 USD (Honorarios Viaje):</span>
                          <span className="font-mono font-bold text-[#00C8D4]">
                            Bs. {((parseFloat(editRate) || 0) * 20).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">$165 USD (Cotización / Expedición):</span>
                          <span className="font-mono font-bold text-pink-400">
                            Bs. {((parseFloat(editRate) || 0) * 165).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setEditId(null)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-white/5 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => update.mutate({ id: r.id, rate: parseFloat(editRate), source: editSource })}
                          disabled={update.isPending}
                          className="px-4 py-1.5 rounded-xl text-xs font-black text-white cursor-pointer shadow-lg disabled:opacity-50"
                          style={{ background: `linear-gradient(135deg, ${FUCSIA} 0%, ${PURPURA} 100%)` }}
                        >
                          {update.isPending ? "Guardando..." : "Guardar Tasa"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View mode */
                    <div className="space-y-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white font-mono tracking-tight">
                          Bs. {r.rate.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-slate-400 font-bold">{r.toCurrency} / {r.fromCurrency}</span>
                      </div>

                      <div className="p-3 bg-black/30 rounded-xl border border-white/5 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>$20 USD (Honorarios):</span>
                          <span className="font-mono font-bold text-[#00C8D4]">
                            Bs. {(r.rate * 20).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>$165 USD:</span>
                          <span className="font-mono font-bold text-pink-300">
                            Bs. {(r.rate * 165).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-1">
                        <span>Fuente: <strong className="text-white">{r.source || "BCV Oficial"}</strong></span>
                        {r.updatedAt && <span>Actualizado: {new Date(r.updatedAt).toLocaleDateString("es-VE")}</span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-[#00C8D4]/10 border border-[#00C8D4]/30 rounded-3xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#00C8D4]/20 border border-[#00C8D4]/30 flex items-center justify-center text-[#00C8D4] shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-200 font-medium leading-relaxed">
            💡 <strong>Sincronización en Tiempo Real:</strong> Al modificar la tasa oficial BCV, todos los valores en Bolívares de honorarios de viaje ($20 USD), cotizaciones personalizadas ($165 USD), viáticos y estados financieros se actualizan en vivo sin necesidad de recargar la página.
          </p>
        </div>

      </div>
    </AdminLayout>
  );
}
export default AdminTasas;

