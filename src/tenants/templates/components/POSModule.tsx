import React, { useState, useEffect } from "react";
import { useTenant } from "../../tenantContext";
import { createTenantClient } from "../../lib/supabaseTenant";
import { 
  Coffee, Utensils, Compass, Sparkles, Plus, Minus, 
  ShoppingCart, Receipt, CheckCircle, AlertTriangle, Loader2 
} from "lucide-react";

interface POSItem {
  id: string;
  name: string;
  category: "comida" | "bebida" | "actividad" | "spa";
  price: number;
  description: string;
}

interface CartItem {
  item: POSItem;
  quantity: number;
}

// Menú de consumos de alta gama disponibles para el Complejo Premium / Club
const POS_MENU_ITEMS: POSItem[] = [
  { id: "p1", name: "Langosta a la Parrilla Roques", category: "comida", price: 45, description: "Langosta fresca del día con mantequilla de ajo y yuca frita." },
  { id: "p2", name: "Ceviche de Mero Tropical", category: "comida", price: 24, description: "Con mango, cilantro, cebolla morada y chips de plátano." },
  { id: "p3", name: "Cóctel Fucsia Sunset", category: "bebida", price: 12, description: "Ron premium venezolano, fucsia de pitahaya y toque de cian de curaçao." },
  { id: "p4", name: "Ron Carúpano Legendario 21 Años (Copa)", category: "bebida", price: 18, description: "Copa de ron ultra-premium nacional servido con hielo tallado." },
  { id: "p5", name: "Excursión en Yate a Cayo de Agua", category: "actividad", price: 150, description: "Tour privado de día completo con snorkel y almuerzo incluido." },
  { id: "p6", name: "Masaje Relajante Piedras Volcánicas", category: "spa", price: 80, description: "Sesión de 60 minutos con aceites esenciales orgánicos." }
];

export function POSModule() {
  const { config } = useTenant();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [roomNumber, setRoomNumber] = useState("");
  const [guestName, setGuestName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [recentCharges, setRecentCharges] = useState<any[]>([]);
  const [loadingCharges, setLoadingCharges] = useState(true);

  const tenantClient = createTenantClient(config.establishment_id);

  // Cargar cargos recientes del POS
  const loadRecentCharges = async () => {
    try {
      setLoadingCharges(true);
      const { data, error } = await tenantClient
        .from("pos_charges")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error || !data) {
        // Fallback a localStorage si la tabla no existe en el Core
        const localKey = "hdv_mock_pos_charges";
        const local = JSON.parse(localStorage.getItem(localKey) || "[]")
          .filter((c: any) => c.establishment_id === config.establishment_id)
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);
        setRecentCharges(local);
      } else {
        setRecentCharges(data);
      }
    } catch (e) {
      // Fallback
      const localKey = "hdv_mock_pos_charges";
      const local = JSON.parse(localStorage.getItem(localKey) || "[]")
        .filter((c: any) => c.establishment_id === config.establishment_id)
        .slice(0, 5);
      setRecentCharges(local);
    } finally {
      setLoadingCharges(false);
    }
  };

  useEffect(() => {
    loadRecentCharges();
  }, [config.establishment_id]);

  const addToCart = (item: POSItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.item.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.item.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prev.filter((i) => i.item.id !== itemId);
    });
  };

  const totalCartPrice = cart.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);

  const handleChargeToRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !roomNumber || !guestName) {
      alert("Por favor ingrese la habitación, el huésped y añada ítems al carrito.");
      return;
    }

    setIsSubmitting(true);

    const chargeDetails = cart.map((i) => `${i.item.name} (x${i.quantity})`).join(", ");

    try {
      // Registrar en Supabase Core mediante nuestro wrapper seguro
      const { error } = await tenantClient.from("pos_charges").insert({
        room_number: roomNumber,
        guest_name: guestName,
        details: chargeDetails,
        total_amount: totalCartPrice,
        status: "charged_to_room",
        items_json: JSON.stringify(cart)
      });

      if (error) {
        console.warn("La tabla de base de datos 'pos_charges' falló, simulando localmente:", error);
        // Fallback localstorage
        const localKey = "hdv_mock_pos_charges";
        const current = JSON.parse(localStorage.getItem(localKey) || "[]");
        current.push({
          id: Math.floor(Math.random() * 1000000),
          establishment_id: config.establishment_id,
          room_number: roomNumber,
          guest_name: guestName,
          details: chargeDetails,
          total_amount: totalCartPrice,
          status: "charged_to_room",
          created_at: new Date().toISOString()
        });
        localStorage.setItem(localKey, JSON.stringify(current));
      }

      setSuccess(true);
      setCart([]);
      setRoomNumber("");
      setGuestName("");
      setTimeout(() => {
        setSuccess(false);
        loadRecentCharges();
      }, 3000);

    } catch (err) {
      console.error("Error al procesar cargo POS:", err);
      alert("Hubo un error de comunicación con el Core central.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryIcons = {
    comida: <Utensils className="w-4 h-4 text-white" />,
    bebida: <Coffee className="w-4 h-4 text-white" />,
    actividad: <Compass className="w-4 h-4 text-white" />,
    spa: <Sparkles className="w-4 h-4 text-white" />
  };

  const categoryColors = {
    comida: "bg-[#00C8D4]", // Cian
    bebida: "bg-[#FF0096]", // Magenta
    actividad: "bg-[#9B00CC]", // Púrpura
    spa: "bg-emerald-500" // Verde
  };

  return (
    <div id="pos" className="bg-[#1a0533] border border-[#FF0096]/20 rounded-3xl p-6 md:p-8 text-white shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] tracking-[0.2em] font-extrabold text-[#FF0096] uppercase block mb-1">
            MÓDULO PREMIUM INTEGRADO
          </span>
          <h3 className="text-2xl font-bold font-serif">Punto de Venta Club POS</h3>
          <p className="text-slate-400 text-xs mt-1">
            Simulador de consumos de alta gama para cargos directos a la suite.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#0e011f]/60 px-4 py-2.5 border border-[#9B00CC]/20 rounded-2xl">
          <ShoppingCart className="w-4 h-4 text-[#00C8D4]" />
          <span className="text-xs font-bold text-slate-200">Carrito:</span>
          <span className="text-xs font-black text-[#FF0096]">${totalCartPrice} USD</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Catálogo de Productos/Servicios */}
        <div className="lg:col-span-7 space-y-4">
          <h4 className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-3">
            Menú de Experiencias y Consumos
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {POS_MENU_ITEMS.map((item) => (
              <div 
                key={item.id} 
                className="bg-[#0e011f]/60 border border-[#9B00CC]/10 hover:border-[#00C8D4]/40 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    {/* Caja unicolor sólida con vector blanco */}
                    <div className={`p-1.5 rounded-lg ${categoryColors[item.category]} flex items-center justify-center`}>
                      {categoryIcons[item.category]}
                    </div>
                    <span className="text-xs font-black text-[#00C8D4]">${item.price} USD</span>
                  </div>
                  <h5 className="text-xs font-bold font-serif text-slate-200 line-clamp-1">{item.name}</h5>
                  <p className="text-slate-400 text-[10px] mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <button
                  onClick={() => addToCart(item)}
                  className="mt-4 w-full py-2 bg-gradient-to-r from-[#0e011f] to-[#1a0533] border border-[#9B00CC]/20 hover:border-[#00C8D4] rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Facturación y Cargo a Habitación */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0e011f]/80 border border-[#9B00CC]/20 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#FF0096] flex items-center gap-2">
              <Receipt className="w-4 h-4" /> Resumen de Cuenta
            </h4>

            {success ? (
              <div className="bg-[#00C8D4]/10 border border-[#00C8D4]/30 rounded-xl p-4 text-center py-8">
                <CheckCircle className="w-8 h-8 text-[#00C8D4] mx-auto mb-2 animate-bounce" />
                <h5 className="text-sm font-bold text-white">Cargo Registrado</h5>
                <p className="text-slate-400 text-[10px] mt-1">
                  Los consumos han sido vinculados a la suite de forma exitosa.
                </p>
              </div>
            ) : (
              <form onSubmit={handleChargeToRoom} className="space-y-4">
                {/* Ítems del Carrito */}
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {cart.length === 0 ? (
                    <p className="text-[10px] text-slate-500 text-center py-6">
                      El carrito de consumos está vacío.
                    </p>
                  ) : (
                    cart.map(({ item, quantity }) => (
                      <div key={item.id} className="flex items-center justify-between text-xs bg-[#1a0533]/50 p-2 rounded-xl border border-[#9B00CC]/10">
                        <div className="max-w-[70%]">
                          <p className="font-bold text-slate-200 line-clamp-1">{item.name}</p>
                          <p className="text-slate-500 text-[9px]">${item.price} USD x {quantity}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 rounded bg-[#0e011f] border border-[#FF0096]/20 hover:border-[#FF0096] text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-1.5">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => addToCart(item)}
                            className="p-1 rounded bg-[#0e011f] border border-[#00C8D4]/20 hover:border-[#00C8D4] text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-[#9B00CC]/10 pt-4 space-y-3">
                  <div>
                    <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
                      Número de Habitación / Suite
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Suite 501"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className="w-full bg-[#1a0533] border border-[#9B00CC]/30 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00C8D4]"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
                      Nombre del Huésped Titular
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Carlos Mendoza"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-[#1a0533] border border-[#9B00CC]/30 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00C8D4]"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center bg-[#1a0533] p-3 rounded-xl border border-[#9B00CC]/10">
                  <span className="text-xs font-bold text-slate-400">Total a Cargar:</span>
                  <span className="text-sm font-black text-[#FF0096]">${totalCartPrice} USD</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full py-3 bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:scale-102 active:scale-98 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-[#FF0096]/10"
                >
                  {isSubmitting ? "Procesando cargo..." : "Cargar a Habitación"}
                </button>
              </form>
            )}
          </div>

          {/* Historial de Cargos Recientes (Aislamiento Lógico del Tenant) */}
          <div className="space-y-3">
            <h5 className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
              Últimos cargos al Complejo (Seguridad Lógica)
            </h5>
            {loadingCharges ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 text-[#00C8D4] animate-spin" />
              </div>
            ) : recentCharges.length === 0 ? (
              <p className="text-[9px] text-slate-500 italic">No hay cargos de POS registrados para este establecimiento.</p>
            ) : (
              <div className="space-y-2">
                {recentCharges.map((charge) => (
                  <div 
                    key={charge.id} 
                    className="bg-[#0e011f]/40 border border-[#9B00CC]/10 rounded-xl p-3 text-[10px] flex justify-between items-center"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-bold text-white">{charge.room_number || "Suite"}</span>
                        <span className="text-slate-500">|</span>
                        <span className="text-slate-400 truncate max-w-[120px]">{charge.guest_name}</span>
                      </div>
                      <p className="text-slate-500 text-[9px] line-clamp-1">{charge.details}</p>
                    </div>
                    <span className="font-bold text-[#00C8D4] shrink-0">${charge.total_amount} USD</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
