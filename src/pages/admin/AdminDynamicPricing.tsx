import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { 
  TrendingUp, 
  Plus, 
  Trash2, 
  Loader2, 
  BarChart3, 
  Settings,
  Sparkles,
  Award,
  X
} from "lucide-react";
import type { DynamicPricingRule } from "@/types/modules";

export function AdminDynamicPricing() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, nav] = useLocation();
  const qc = useQueryClient();

  const [modal, setModal] = useState(false);
  const [selectedEstablishment, setSelectedEstablishment] = useState<number | "">("");
  const [selectedRoom, setSelectedRoom] = useState<number | "">("");
  const [basePrice, setBasePrice] = useState<number>(100);
  const [demandFactor, setDemandFactor] = useState<number>(1.00);
  const [occupancyThreshold, setOccupancyThreshold] = useState<number>(80);
  const [increasePercent, setIncreasePercent] = useState<number>(15);

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && profile?.role !== "owner" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      nav("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Query establishments
  const { data: establishments = [] } = useQuery<any[]>({
    queryKey: ["admin-establishments-for-pricing"],
    queryFn: async () => {
      let query = supabase.from("establishments").select("id, name");
      if (profile?.role === "owner") {
        query = query.eq("owner_user_id", user?.id);
      }
      const { data } = await query;
      return data || [];
    },
    enabled: !!user
  });

  // Query rooms
  const { data: rooms = [] } = useQuery<any[]>({
    queryKey: ["admin-rooms-for-pricing", selectedEstablishment],
    queryFn: async () => {
      if (!selectedEstablishment) return [];
      const { data } = await supabase.from("rooms").select("id, name").eq("establishment_id", selectedEstablishment);
      return data || [];
    },
    enabled: !!selectedEstablishment
  });

  // Query pricing rules
  const { data: rules = [], isLoading } = useQuery<any[]>({
    queryKey: ["admin-pricing-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dynamic_pricing_rules")
        .select(`
          *,
          rooms (name),
          establishments (name)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Create rule
  const createRule = useMutation({
    mutationFn: async () => {
      if (!selectedEstablishment || !selectedRoom) {
        alert("El alojamiento y la habitación son requeridos.");
        return;
      }
      const { error } = await supabase.from("dynamic_pricing_rules").insert({
        establishment_id: Number(selectedEstablishment),
        room_id: Number(selectedRoom),
        base_price: Number(basePrice),
        demand_factor: Number(demandFactor),
        rules_config: {
          occupancy_threshold: Number(occupancyThreshold),
          increase_percent: Number(increasePercent)
        },
        is_active: true
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-pricing-rules"] });
      setModal(false);
      setSelectedEstablishment("");
      setSelectedRoom("");
    }
  });

  // Delete rule
  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("dynamic_pricing_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-pricing-rules"] });
    }
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e011f] text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#00C8D4]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <AdminTabBar />

      {/* Hero Header */}
      <section className="relative w-full h-48 flex items-center justify-center overflow-hidden bg-[#0e011f] mb-10 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0e011f] to-[#1a0533] opacity-90 z-10" />
        <div className="relative z-20 text-center text-white px-4">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00C8D4] mb-3 block">
            REVENUE MANAGEMENT BI
          </span>
          <h1 className="text-2xl sm:text-4xl font-serif font-black text-white">
            Configuración de Precios Dinámicos
          </h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        
        <div className="flex justify-between items-center gap-4 mb-8">
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-gray-900">Tarifas Inteligentes Activas</h2>
            <p className="text-xs text-gray-400 font-bold mt-0.5">Establece multiplicadores basados en ocupación e índices de temporada.</p>
          </div>
          <button 
            onClick={() => setModal(true)}
            className="btn-cyan-gradient text-white text-xs font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#00C8D4]/15"
          >
            <Plus className="w-4 h-4" /> Agregar Regla BI
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-[#00C8D4]" />
          </div>
        ) : rules.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs text-left">
            <p className="text-xs text-gray-400 font-bold text-center">No hay reglas de precios dinámicos activas en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {rules.map((rule) => (
              <div key={rule.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md flex flex-col justify-between hover:shadow-lg transition-shadow">
                <div>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#00C8D4]/10 border border-[#00C8D4]/20 flex items-center justify-center text-[#00C8D4]">
                      <TrendingUp className="w-4 h-4 text-[#00C8D4]" />
                    </div>
                    <button 
                      onClick={() => deleteRule.mutate(rule.id)}
                      className="text-gray-400 hover:text-[#FF0096] transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-extrabold text-sm text-gray-900">{rule.rooms?.name || "Habitación"}</h3>
                  <p className="text-[10px] text-gray-400 font-bold mt-0.5">{rule.establishments?.name || "Hotel asociado"}</p>

                  <div className="mt-4 space-y-1.5 border-t border-gray-50 pt-3 text-xs text-gray-600 font-semibold">
                    <div className="flex justify-between">
                      <span>Precio Base:</span>
                      <span className="font-extrabold text-gray-800">${rule.base_price} USD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Multiplicador Demanda:</span>
                      <span className="font-extrabold text-gray-800">x{rule.demand_factor}</span>
                    </div>
                    {rule.rules_config?.occupancy_threshold && (
                      <div className="flex justify-between">
                        <span>Aumento por Ocupación:</span>
                        <span className="font-extrabold text-[#9B00CC]">
                          +{rule.rules_config.increase_percent}% (si ocupa &gt; {rule.rules_config.occupancy_threshold}%)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#00C8D4] animate-pulse" />
                  <span className="text-[9px] uppercase font-black text-gray-400">Automatización Activa</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Add rule modal */}
      {modal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative border border-gray-100 animate-scale-up text-left">
            <button 
              onClick={() => setModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-black text-base text-gray-900 uppercase tracking-wider mb-6">Configurar Regla de Precios BI</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Alojamiento</label>
                <select
                  value={selectedEstablishment}
                  onChange={(e) => {
                    setSelectedEstablishment(e.target.value ? Number(e.target.value) : "");
                    setSelectedRoom("");
                  }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#00C8D4] transition-colors bg-white cursor-pointer"
                >
                  <option value="">Selecciona el hotel</option>
                  {establishments.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Habitación / Categoría</label>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value ? Number(e.target.value) : "")}
                  disabled={!selectedEstablishment}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#00C8D4] transition-colors bg-white cursor-pointer disabled:opacity-50"
                >
                  <option value="">Selecciona la unidad</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Precio Base ($)</label>
                  <input 
                    type="number" 
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#00C8D4] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Multiplicador Demanda</label>
                  <input 
                    type="number" 
                    step="0.05"
                    value={demandFactor}
                    onChange={(e) => setDemandFactor(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#00C8D4] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Límite Ocupación (%)</label>
                  <input 
                    type="number" 
                    value={occupancyThreshold}
                    onChange={(e) => setOccupancyThreshold(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#00C8D4] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Aumento (%)</label>
                  <input 
                    type="number" 
                    value={increasePercent}
                    onChange={(e) => setIncreasePercent(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#00C8D4] transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setModal(false)}
                className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-600 font-extrabold py-3 px-4 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={() => createRule.mutate()}
                className="flex-1 btn-cyan-gradient text-white font-extrabold py-3 px-4 rounded-xl text-xs hover:scale-102 transition-transform cursor-pointer shadow-md shadow-[#00C8D4]/10"
              >
                Guardar Regla BI
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
