import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { 
  Award, 
  Tag, 
  Plus, 
  Trash2, 
  Loader2, 
  User, 
  Clock, 
  Sparkles,
  Ticket,
  X
} from "lucide-react";
import type { LoyaltyProfile, LastMinuteCoupon } from "@/types/modules";

export function AdminLoyaltyCoupons() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, nav] = useLocation();
  const qc = useQueryClient();

  const [modal, setModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(15);
  const [maxUses, setMaxUses] = useState<number>(1);
  const [selectedEstablishment, setSelectedEstablishment] = useState<number | "">("");
  const [expiryHours, setExpiryHours] = useState<number>(12);

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      nav("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Query loyalty profiles
  const { data: loyaltyProfiles = [], isLoading: loadingLoyalty } = useQuery<any[]>({
    queryKey: ["admin-loyalty-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loyalty_profiles")
        .select(`
          *,
          user_profiles:user_id (name, email)
        `)
        .order("points", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Query active establishments for coupon mapping
  const { data: establishments = [] } = useQuery<any[]>({
    queryKey: ["admin-establishments-for-coupons"],
    queryFn: async () => {
      const { data } = await supabase.from("establishments").select("id, name");
      return data || [];
    },
    enabled: !!user
  });

  // Query coupons
  const { data: coupons = [], isLoading: loadingCoupons } = useQuery<any[]>({
    queryKey: ["admin-coupons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("last_minute_coupons")
        .select(`
          *,
          establishments (name)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Create coupon
  const createCoupon = useMutation({
    mutationFn: async () => {
      if (!couponCode || !selectedEstablishment) {
        alert("El código de cupón y el alojamiento son obligatorios.");
        return;
      }
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + Number(expiryHours));

      const { error } = await supabase.from("last_minute_coupons").insert({
        establishment_id: Number(selectedEstablishment),
        code: couponCode.toUpperCase(),
        discount_percent: Number(discountPercent),
        max_uses: Number(maxUses),
        expires_at: expiresAt.toISOString(),
        is_active: true
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
      setModal(false);
      setCouponCode("");
      setSelectedEstablishment("");
    }
  });

  // Delete coupon
  const deleteCoupon = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("last_minute_coupons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
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
            FIDELIZACIÓN Y PREMIOS
          </span>
          <h1 className="text-2xl sm:text-4xl font-serif font-black text-white">
            Membresías Club & Cupones
          </h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
          
          {/* Coupons list */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md">
            <div className="flex justify-between items-center mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF0096]/10 flex items-center justify-center border border-[#FF0096]/20">
                  <Ticket className="w-5 h-5 text-[#FF0096]" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-gray-900 uppercase tracking-wider">Cupones Last-Minute</h3>
                  <p className="text-[10px] text-gray-400 font-bold mt-0.5">Cupones express con alta tasa de descuento.</p>
                </div>
              </div>
              <button 
                onClick={() => setModal(true)}
                className="btn-magenta-gradient text-white text-xs font-extrabold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm shadow-[#FF0096]/10"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Cupón
              </button>
            </div>

            {loadingCoupons ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-[#FF0096]" />
              </div>
            ) : coupons.length === 0 ? (
              <p className="text-xs text-gray-400 font-bold py-6 text-center">No hay cupones activos actualmente.</p>
            ) : (
              <div className="space-y-4">
                {coupons.map((c) => {
                  const active = c.is_active && new Date(c.expires_at) > new Date();
                  return (
                    <div key={c.id} className="p-4 border border-gray-50 rounded-2xl flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-gray-900">{c.code}</span>
                          <span className="bg-[#FF0096]/10 text-[#FF0096] text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                            -{c.discount_percent}%
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold mt-1">{c.establishments?.name || "Hotel asociado"}</p>
                        <p className="text-[9px] text-gray-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" /> Expiración: {new Date(c.expires_at).toLocaleString()}
                        </p>
                      </div>
                      <button 
                        onClick={() => deleteCoupon.mutate(c.id)}
                        className="text-gray-400 hover:text-[#FF0096] transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Loyalty profiles */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#00C8D4]/10 flex items-center justify-center border border-[#00C8D4]/20">
                <Award className="w-5 h-5 text-[#00C8D4]" />
              </div>
              <div>
                <h3 className="font-black text-sm text-gray-900 uppercase tracking-wider">Membresías Club & Puntos</h3>
                <p className="text-[10px] text-gray-400 font-bold mt-0.5">Turistas con puntos acumulados en la plataforma.</p>
              </div>
            </div>

            {loadingLoyalty ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-[#00C8D4]" />
              </div>
            ) : loyaltyProfiles.length === 0 ? (
              <p className="text-xs text-gray-400 font-bold py-6 text-center">No hay registros de puntos en el sistema.</p>
            ) : (
              <div className="space-y-4">
                {loyaltyProfiles.map((p) => (
                  <div key={p.user_id} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-gray-500">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{p.user_profiles?.name || "Socio Club"}</p>
                        <p className="text-[9px] text-gray-400 font-semibold mt-0.5">{p.user_profiles?.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-gray-900 block">{p.points} Pts</span>
                      <span className="text-[8px] font-black uppercase text-[#9B00CC] tracking-wider block mt-0.5">{p.tier}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Add coupon modal */}
      {modal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative border border-gray-100 animate-scale-up text-left">
            <button 
              onClick={() => setModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-black text-base text-gray-900 uppercase tracking-wider mb-6">Generar Cupón de Oferta</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Código de Cupón</label>
                <input 
                  type="text" 
                  placeholder="ej. CARNAVAL50" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#00C8D4] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Alojamiento Vinculado</label>
                <select
                  value={selectedEstablishment}
                  onChange={(e) => setSelectedEstablishment(e.target.value ? Number(e.target.value) : "")}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#00C8D4] transition-colors bg-white cursor-pointer"
                >
                  <option value="">Selecciona el hotel</option>
                  {establishments.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Descuento (%)</label>
                  <input 
                    type="number" 
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#00C8D4] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 font-sans">Usos Máximos</label>
                  <input 
                    type="number" 
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#00C8D4] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Expira en (Horas)</label>
                <input 
                  type="number" 
                  value={expiryHours}
                  onChange={(e) => setExpiryHours(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#00C8D4] transition-colors"
                />
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
                onClick={() => createCoupon.mutate()}
                className="flex-1 btn-magenta-gradient text-white font-extrabold py-3 px-4 rounded-xl text-xs hover:scale-102 transition-transform cursor-pointer shadow-md shadow-[#FF0096]/10"
              >
                Crear Cupón
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
