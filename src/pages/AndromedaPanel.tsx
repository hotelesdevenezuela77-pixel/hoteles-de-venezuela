import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { 
  Star, Clock, Award, Plus, Wallet, History, 
  Building2, ChevronRight, AlertCircle, CheckCircle2, 
  Loader2, ArrowLeft, Camera, MapPin, Lightbulb, 
  LayoutDashboard, X, FileText
} from "lucide-react";

interface PointsData {
  total_points: number;
  available_points: number;
  withdrawn_points: number;
  payment_method: string | null;
  payment_details: string | null;
}

interface Transaction {
  id: number;
  type: string;
  points: number;
  description: string;
  created_at: string;
}

interface Withdrawal {
  id: number;
  points_requested: number;
  usd_amount: number;
  status: string;
  payment_method: string;
  payment_details: string;
  created_at: string;
}

interface TouristSiteContribution {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  status: string;
  created_at: string;
}

interface TourismTipContribution {
  id: number;
  title: string;
  content: string;
  status: string;
  created_at: string;
}

export function AndromedaPanel() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"resumen" | "sitios" | "tips" | "pago">("resumen");

  // Puntos y balances
  const [pointsData, setPointsData] = useState<PointsData>({
    total_points: 0,
    available_points: 0,
    withdrawn_points: 0,
    payment_method: "",
    payment_details: ""
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  // Aportes del usuario
  const [mySites, setMySites] = useState<TouristSiteContribution[]>([]);
  const [myTips, setMyTips] = useState<TourismTipContribution[]>([]);

  // Modales y formularios
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawPoints, setWithdrawPoints] = useState(0);
  const [withdrawing, setWithdrawing] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);

  const [showSiteModal, setShowSiteModal] = useState(false);
  const [siteForm, setSiteForm] = useState({ name: "", short_description: "", long_description: "", image_url: "", category: "", highlights: "" });
  const [savingSite, setSavingSite] = useState(false);

  const [showTipModal, setShowTipModal] = useState(false);
  const [tipForm, setTipForm] = useState({ title: "", content: "", image_url: "", icon: "lightbulb" });
  const [savingTip, setSavingTip] = useState(false);

  const usdRate = 0.10; // 1 punto = $0.10 USD
  const minWithdrawalPoints = 100; // Mínimo 100 puntos para retirar

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);

      // 1. Get Points Balance
      const { data: ptData } = await supabase
        .from("andromeda_points")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (ptData) {
        setPointsData({
          total_points: ptData.total_points || 0,
          available_points: ptData.available_points || 0,
          withdrawn_points: ptData.withdrawn_points || 0,
          payment_method: ptData.payment_method || "",
          payment_details: ptData.payment_details || ""
        });
        setPaymentMethod(ptData.payment_method || "");
        setPaymentDetails(ptData.payment_details || "");
      } else {
        // Initialize points profile silently
        await supabase.from("andromeda_points").insert([{
          user_id: user.id,
          user_email: user.email || "",
          total_points: 0,
          withdrawn_points: 0,
          available_points: 0
        }]);
      }

      // 2. Get Transactions
      const { data: txData } = await supabase
        .from("andromeda_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (txData) setTransactions(txData);

      // 3. Get Withdrawals
      const { data: wData } = await supabase
        .from("andromeda_withdrawals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (wData) setWithdrawals(wData);

      // 4. Get User contributions (Tourist Sites and Tips)
      const [sitesRes, tipsRes] = await Promise.all([
        supabase.from("tourist_sites").select("id, name, slug, short_description, status, created_at").eq("created_by_user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("tourism_tips").select("id, title, content, status, created_at").eq("created_by_user_id", user.id).order("created_at", { ascending: false })
      ]);

      if (sitesRes.data) setMySites(sitesRes.data as TouristSiteContribution[]);
      if (tipsRes.data) setMyTips(tipsRes.data as TourismTipContribution[]);

    } catch (e) {
      console.error("Error loading Portal Andromeda data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Request withdrawal payout
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || withdrawPoints < minWithdrawalPoints || withdrawPoints > pointsData.available_points) return;
    if (!paymentMethod || !paymentDetails) {
      alert("Por favor configura tus datos de cobro antes de solicitar un retiro.");
      return;
    }

    try {
      setWithdrawing(true);
      const usdAmount = withdrawPoints * usdRate;

      const { error } = await supabase.from("andromeda_withdrawals").insert([{
        user_id: user.id,
        user_email: user.email || "",
        points_requested: withdrawPoints,
        usd_amount: usdAmount,
        payment_method: paymentMethod,
        payment_details: paymentDetails,
        status: "pending"
      }]);

      if (error) throw error;

      // Update points values
      const newAvailable = pointsData.available_points - withdrawPoints;
      const newWithdrawn = pointsData.withdrawn_points + withdrawPoints;

      await supabase
        .from("andromeda_points")
        .update({
          available_points: newAvailable,
          withdrawn_points: newWithdrawn
        })
        .eq("user_id", user.id);

      setShowWithdrawModal(false);
      await fetchData();
      alert("¡Solicitud de retiro enviada con éxito!");
    } catch (err) {
      console.error("Error making withdrawal:", err);
      alert("Ocurrió un error al procesar el retiro.");
    } finally {
      setWithdrawing(false);
    }
  };

  // Save payment method details
  const handleSavePayment = async () => {
    if (!user || !paymentMethod || !paymentDetails) return;
    try {
      setSavingPayment(true);
      const { error } = await supabase
        .from("andromeda_points")
        .update({
          payment_method: paymentMethod,
          payment_details: paymentDetails
        })
        .eq("user_id", user.id);

      if (error) throw error;
      alert("Información de cobro guardada correctamente.");
      await fetchData();
    } catch (err) {
      console.error("Error saving payment info:", err);
      alert("Error al guardar la información de pago.");
    } finally {
      setSavingPayment(false);
    }
  };

  // Contribute Tourist Site
  const handleSiteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !siteForm.name || !siteForm.short_description) return;

    try {
      setSavingSite(true);
      const slug = siteForm.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      const { error } = await supabase.from("tourist_sites").insert([{
        name: siteForm.name,
        slug,
        short_description: siteForm.short_description,
        long_description: siteForm.long_description,
        image_url: siteForm.image_url || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        category: siteForm.category || "Atracción",
        highlights: siteForm.highlights,
        status: "pending",
        created_by_user_id: user.id
      }]);

      if (error) throw error;

      setShowSiteModal(false);
      setSiteForm({ name: "", short_description: "", long_description: "", image_url: "", category: "", highlights: "" });
      await fetchData();
      alert("¡Sitio turístico enviado para revisión! Ganarás puntos tras su aprobación.");
    } catch (err) {
      console.error("Error saving tourist site contribution:", err);
      alert("Error al enviar el sitio turístico.");
    } finally {
      setSavingSite(false);
    }
  };

  // Contribute Tourism Tip
  const handleTipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !tipForm.title || !tipForm.content) return;

    try {
      setSavingTip(true);
      const { error } = await supabase.from("tourism_tips").insert([{
        title: tipForm.title,
        content: tipForm.content,
        image_url: tipForm.image_url || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800",
        icon: tipForm.icon || "lightbulb",
        status: "pending",
        created_by_user_id: user.id
      }]);

      if (error) throw error;

      setShowTipModal(false);
      setTipForm({ title: "", content: "", image_url: "", icon: "lightbulb" });
      await fetchData();
      alert("¡Tip de viaje enviado para revisión! Ganarás puntos tras su aprobación.");
    } catch (err) {
      console.error("Error saving tourism tip contribution:", err);
      alert("Error al enviar el tip de viaje.");
    } finally {
      setSavingTip(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved": return "Aprobado";
      case "rejected": return "Rechazado";
      default: return "Pendiente";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-cyan-950 flex flex-col items-center justify-center gap-3 text-white">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
        <p className="text-cyan-200/60 text-xs font-bold">Iniciando Portal Andromeda...</p>
      </div>
    );
  }

  const canWithdraw = pointsData.available_points >= minWithdrawalPoints && paymentMethod;
  const totalContributions = mySites.length + myTips.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-cyan-950 text-white pb-20">
      
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/mis-negocios" className="text-white/60 hover:text-white transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-cyan-400 fill-cyan-400 animate-pulse" />
                <span>Portal Andromeda</span>
              </h1>
              <p className="text-[10px] text-white/50">{user?.email}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-black/20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-2">
            {[
              { id: "resumen", label: "Resumen y Puntos", icon: LayoutDashboard },
              { id: "sitios", label: `Sitios Turísticos (${mySites.length})`, icon: MapPin },
              { id: "tips", label: `Tips de Viaje (${myTips.length})`, icon: Lightbulb },
              { id: "pago", label: "Información de Cobro", icon: Wallet }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 border-b-2 flex items-center gap-2 text-xs font-bold cursor-pointer transition-all ${
                  activeTab === tab.id
                    ? "border-cyan-400 text-cyan-400 font-black"
                    : "border-transparent text-white/40 hover:text-white"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* TAB RESUMEN */}
        {activeTab === "resumen" && (
          <div className="space-y-8">
            
            {/* Balance Card */}
            <div className="bg-gradient-to-r from-fuchsia-500/10 to-cyan-500/10 border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative z-10">
                <div className="flex flex-col justify-center">
                  <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">Puntos Acumulados</span>
                  <span className="text-5xl font-black text-white">{pointsData.total_points}</span>
                </div>
                
                <div className="flex flex-col justify-center border-y md:border-y-0 md:border-x border-white/5 py-6 md:py-0">
                  <span className="text-cyan-300/40 text-[10px] uppercase font-bold tracking-wider mb-1">Puntos Disponibles</span>
                  <span className="text-5xl font-black text-cyan-400">{pointsData.available_points}</span>
                  <span className="text-sm text-emerald-400 font-bold mt-1.5">≈ ${(pointsData.available_points * usdRate).toFixed(2)} USD</span>
                </div>

                <div className="flex flex-col justify-center">
                  <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">Retiros Cobrados</span>
                  <span className="text-5xl font-black text-white/50">{pointsData.withdrawn_points}</span>
                </div>
              </div>

              <div className="mt-8 flex flex-col items-center gap-3 relative z-10">
                <button
                  onClick={() => {
                    setWithdrawPoints(pointsData.available_points);
                    setShowWithdrawModal(true);
                  }}
                  disabled={!canWithdraw}
                  className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/20 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Wallet className="w-4 h-4" />
                  Solicitar Cobro de Puntos
                </button>
                {!canWithdraw && (
                  <p className="text-[10px] text-white/30 leading-normal">
                    * Mínimo {minWithdrawalPoints} puntos (${(minWithdrawalPoints * usdRate).toFixed(0)} USD) y método de cobro guardado.
                  </p>
                )}
              </div>
            </div>

            {/* Contributions Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white/5 border border-white/5 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="w-5 h-5 text-fuchsia-400" />
                  <h4 className="text-sm font-bold text-white">Total Contribuciones</h4>
                </div>
                <p className="text-3xl font-black">{totalContributions}</p>
                <p className="text-[10px] text-white/30 mt-1">Aportes enviados</p>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-5 h-5 text-green-400" />
                  <h4 className="text-sm font-bold text-white">Sitios Sugeridos</h4>
                </div>
                <p className="text-3xl font-black">{mySites.length}</p>
                <p className="text-[10px] text-white/30 mt-1">Sitios registrados</p>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  <h4 className="text-sm font-bold text-white">Tips de Viaje</h4>
                </div>
                <p className="text-3xl font-black">{myTips.length}</p>
                <p className="text-[10px] text-white/30 mt-1">Tips creados</p>
              </div>

            </div>

            {/* Ledger Transactions & Payouts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Transactions list */}
              <div className="bg-white/5 border border-white/5 rounded-3xl p-6 shadow-sm">
                <h3 className="text-md font-bold mb-4 flex items-center gap-2">
                  <History className="w-4 h-4 text-cyan-400" />
                  Historial de Puntos
                </h3>

                {transactions.length === 0 ? (
                  <p className="text-xs text-white/30 text-center py-10">No posees transacciones registradas.</p>
                ) : (
                  <div className="divide-y divide-white/5">
                    {transactions.slice(0, 5).map(tx => (
                      <div key={tx.id} className="py-3.5 flex justify-between items-center first:pt-0 last:pb-0">
                        <div>
                          <p className="text-xs font-semibold text-white/80">{tx.description}</p>
                          <span className="text-[10px] text-white/30">{new Date(tx.created_at).toLocaleDateString("es-VE")}</span>
                        </div>
                        <span className={`text-sm font-black ${tx.points > 0 ? "text-green-400" : "text-red-400"}`}>
                          {tx.points > 0 ? `+${tx.points}` : tx.points}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Withdrawals list */}
              <div className="bg-white/5 border border-white/5 rounded-3xl p-6 shadow-sm">
                <h3 className="text-md font-bold mb-4 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-brand-magenta" />
                  Cobros y Solicitudes
                </h3>

                {withdrawals.length === 0 ? (
                  <p className="text-xs text-white/30 text-center py-10">No posees solicitudes de cobro.</p>
                ) : (
                  <div className="divide-y divide-white/5">
                    {withdrawals.slice(0, 5).map(w => (
                      <div key={w.id} className="py-3.5 flex justify-between items-center first:pt-0 last:pb-0">
                        <div>
                          <p className="text-xs font-semibold text-white/80">{w.points_requested} puntos → ${w.usd_amount.toFixed(2)} USD</p>
                          <span className="text-[10px] text-white/30">{new Date(w.created_at).toLocaleDateString("es-VE")} ({w.payment_method})</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          w.status === "approved" ? "bg-green-500/15 text-green-400" :
                          w.status === "rejected" ? "bg-red-500/15 text-red-400" :
                          "bg-yellow-500/15 text-yellow-400"
                        }`}>
                          {getStatusText(w.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* TAB SITIOS TURÍSTICOS */}
        {activeTab === "sitios" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-bold">Contribuciones: Sitios Turísticos</h3>
              <button
                onClick={() => setShowSiteModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                Sugerir Sitio
              </button>
            </div>

            {mySites.length === 0 ? (
              <div className="text-center py-20 bg-white/5 border border-white/5 rounded-3xl p-6">
                <MapPin className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-xs text-white/40">No has sugerido sitios turísticos aún. ¡Empieza a sugerir y gana puntos!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mySites.map(site => (
                  <div key={site.id} className="bg-white/5 border border-white/5 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h4 className="font-bold text-white text-sm">{site.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          site.status === "approved" ? "bg-green-500/20 text-green-400" :
                          site.status === "rejected" ? "bg-red-500/20 text-red-400" :
                          "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {getStatusText(site.status)}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 leading-normal line-clamp-2">{site.short_description}</p>
                    </div>
                    <div className="pt-4 border-t border-white/5 mt-4 text-[10px] text-white/30">
                      Enviado el {new Date(site.created_at).toLocaleDateString("es-VE")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB TIPS DE VIAJE */}
        {activeTab === "tips" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-bold">Contribuciones: Tips de Viaje</h3>
              <button
                onClick={() => setShowTipModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                Agregar Tip
              </button>
            </div>

            {myTips.length === 0 ? (
              <div className="text-center py-20 bg-white/5 border border-white/5 rounded-3xl p-6">
                <Lightbulb className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-xs text-white/40">No has aportado tips de viaje. ¡Comparte tus consejos y gana puntos!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myTips.map(tip => (
                  <div key={tip.id} className="bg-white/5 border border-white/5 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h4 className="font-bold text-white text-sm">{tip.title}</h4>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          tip.status === "approved" ? "bg-green-500/20 text-green-400" :
                          tip.status === "rejected" ? "bg-red-500/20 text-red-400" :
                          "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {getStatusText(tip.status)}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 leading-normal line-clamp-2">{tip.content}</p>
                    </div>
                    <div className="pt-4 border-t border-white/5 mt-4 text-[10px] text-white/30">
                      Enviado el {new Date(tip.created_at).toLocaleDateString("es-VE")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB INFORMACIÓN DE PAGO */}
        {activeTab === "pago" && (
          <div className="max-w-xl bg-white/5 border border-white/5 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left">
            <div>
              <h3 className="text-md font-bold mb-2">Configurar Método de Cobro</h3>
              <p className="text-xs text-white/40 leading-relaxed">
                Elige tu método preferido y provee los datos necesarios (Pago Móvil, Zelle o Binance Pay) para transferirte las ganancias.
              </p>
            </div>

            <div className="space-y-4">
              
              {/* Method selection */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-white/60 tracking-wider mb-2">Método de cobro</label>
                <div className="grid grid-cols-3 gap-3">
                  {["Pago Móvil", "Zelle", "Binance"].map(m => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      className={`py-3 px-4 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all ${
                        paymentMethod === m
                          ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                          : "border-white/10 bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment details */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-white/60 tracking-wider mb-1.5">Datos del Pago / Cuenta</label>
                <textarea
                  rows={4}
                  value={paymentDetails}
                  onChange={e => setPaymentDetails(e.target.value)}
                  placeholder="Ej: Pago Móvil - Banesco (0102) - CI 12345678 - Tel 04141234567 o Correo de Zelle / ID de Binance"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all resize-none"
                />
              </div>

              <button
                onClick={handleSavePayment}
                disabled={savingPayment || !paymentMethod || !paymentDetails}
                className="w-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 hover:opacity-95 text-white text-xs font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {savingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando Datos...</span>
                  </>
                ) : (
                  <span>Guardar Datos de Cobro</span>
                )}
              </button>
            </div>
          </div>
        )}

      </main>

      {/* WITHDRAW MODAL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-5 flex items-center justify-between text-white">
              <h3 className="font-extrabold text-sm tracking-wide">Solicitud de Cobro de Ganancias</h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="p-6 space-y-4 text-left">
              <p className="text-xs text-white/50 leading-relaxed text-center">
                Retira tus fondos acumulados. Se transferirán según los datos configurados.
              </p>

              <div>
                <label className="block text-[10px] uppercase font-bold text-white/40 tracking-wider mb-1.5">Cantidad de Puntos a Retirar</label>
                <input
                  type="number"
                  min={minWithdrawalPoints}
                  max={pointsData.available_points}
                  value={withdrawPoints}
                  onChange={e => setWithdrawPoints(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                <span className="text-[10px] uppercase font-bold text-white/30 block mb-1">Monto Equivalente en USD</span>
                <span className="text-2xl font-black text-emerald-400">${(withdrawPoints * usdRate).toFixed(2)} USD</span>
              </div>

              <button
                type="submit"
                disabled={withdrawing || withdrawPoints < minWithdrawalPoints || withdrawPoints > pointsData.available_points}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
              >
                {withdrawing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Procesando Solicitud...</span>
                  </>
                ) : (
                  <span>Confirmar Retiro</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUGGEST TOURIST SITE MODAL */}
      {showSiteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <div className="bg-gradient-to-r from-fuchsia-600 to-cyan-600 px-6 py-5 flex items-center justify-between text-white">
              <h3 className="font-extrabold text-sm tracking-wide">Sugerir Sitio Turístico</h3>
              <button
                onClick={() => setShowSiteModal(false)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSiteSubmit} className="p-6 space-y-4 text-left max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-[10px] uppercase font-bold text-white/40 tracking-wider mb-1.5">Nombre del Sitio *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Cueva del Guácharo"
                  value={siteForm.name}
                  onChange={e => setSiteForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-white/40 tracking-wider mb-1.5">Descripción Corta *</label>
                <input
                  type="text"
                  required
                  placeholder="Resumen del atractivo turístico en una frase"
                  value={siteForm.short_description}
                  onChange={e => setSiteForm(prev => ({ ...prev, short_description: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-white/40 tracking-wider mb-1.5">Descripción Detallada</label>
                <textarea
                  rows={4}
                  placeholder="Explica la ubicación, cómo llegar, historia o actividades recomendadas..."
                  value={siteForm.long_description}
                  onChange={e => setSiteForm(prev => ({ ...prev, long_description: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-white/40 tracking-wider mb-1.5">Categoría</label>
                  <input
                    type="text"
                    placeholder="Ej: Playa, Aventura, Cascadas"
                    value={siteForm.category}
                    onChange={e => setSiteForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-white/40 tracking-wider mb-1.5">Aspecto Destacado</label>
                  <input
                    type="text"
                    placeholder="Ej: Ecoturismo"
                    value={siteForm.highlights}
                    onChange={e => setSiteForm(prev => ({ ...prev, highlights: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-white/40 tracking-wider mb-1.5">Enlace de Imagen</label>
                <input
                  type="url"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={siteForm.image_url}
                  onChange={e => setSiteForm(prev => ({ ...prev, image_url: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={savingSite}
                className="w-full bg-gradient-to-r from-fuchsia-600 to-cyan-600 text-white text-xs font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {savingSite ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando Sitio...</span>
                  </>
                ) : (
                  <span>Enviar para Revisión</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUGGEST TOURISM TIP MODAL */}
      {showTipModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <div className="bg-gradient-to-r from-fuchsia-600 to-cyan-600 px-6 py-5 flex items-center justify-between text-white">
              <h3 className="font-extrabold text-sm tracking-wide">Agregar Tip de Viaje</h3>
              <button
                onClick={() => setShowTipModal(false)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTipSubmit} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-[10px] uppercase font-bold text-white/40 tracking-wider mb-1.5">Título del Tip *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: ¿Cómo ir a Los Roques en lancha?"
                  value={tipForm.title}
                  onChange={e => setTipForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-white/40 tracking-wider mb-1.5">Contenido / Recomendación *</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Escribe en detalle tus consejos, costos aproximados, equipaje recomendado o advertencias..."
                  value={tipForm.content}
                  onChange={e => setTipForm(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-white/40 tracking-wider mb-1.5">Enlace de Imagen</label>
                <input
                  type="url"
                  placeholder="https://ejemplo.com/tip.jpg"
                  value={tipForm.image_url}
                  onChange={e => setTipForm(prev => ({ ...prev, image_url: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={savingTip}
                className="w-full bg-gradient-to-r from-fuchsia-600 to-cyan-600 text-white text-xs font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {savingTip ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando Tip...</span>
                  </>
                ) : (
                  <span>Enviar para Revisión</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
