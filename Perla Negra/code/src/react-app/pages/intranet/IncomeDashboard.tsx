import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Banknote,
  Building2,
  Download,
  Calendar,
  Bed,
  Link2,
} from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Card } from "@/react-app/components/ui/card";
import { Input } from "@/react-app/components/ui/input";

interface IncomeTransaction {
  id: number;
  category: string;
  description: string;
  amount: number;
  payment_method: string;
  reference_number: string;
  reservation_id: number | null;
  transaction_date: string;
  created_by: string;
  notes: string;
  reservation_check_in?: string;
  reservation_check_out?: string;
  guest_name?: string;
  room_code?: string;
}

interface ExchangeRate {
  id: number;
  rate_date: string;
  rate: number;
  source: string;
}

const PAYMENT_METHODS: Record<string, { label: string; icon: typeof DollarSign }> = {
  cash: { label: "Efectivo", icon: Banknote },
  transfer: { label: "Transferencia", icon: Building2 },
  card: { label: "Tarjeta", icon: CreditCard },
  mobile: { label: "Pago Móvil", icon: DollarSign },
  zelle: { label: "Zelle", icon: DollarSign },
};

export default function IncomeDashboard() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // First of month
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Fetch current exchange rate
  const { data: rateData } = useQuery({
    queryKey: ["exchange-rate-current"],
    queryFn: async () => {
      const res = await fetch("/api/exchange-rates/current");
      if (!res.ok) return { rate: null };
      return res.json();
    },
  });

  const currentRate: ExchangeRate | null = rateData?.rate || null;

  // Fetch income transactions
  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ["income-transactions", startDate, endDate],
    queryFn: async () => {
      const res = await fetch(`/api/financial/transactions?start=${startDate}&end=${endDate}&type=income`);
      if (!res.ok) throw new Error("Error fetching transactions");
      return res.json();
    },
  });

  const transactions: IncomeTransaction[] = transactionsData?.transactions || [];

  // Calculate totals
  const totalIncome = transactions.reduce((sum, t) => sum + t.amount, 0);
  const reservationIncome = transactions
    .filter((t) => t.reservation_id)
    .reduce((sum, t) => sum + t.amount, 0);
  const otherIncome = totalIncome - reservationIncome;

  // Group by payment method
  const byPaymentMethod = transactions.reduce((acc, t) => {
    acc[t.payment_method] = (acc[t.payment_method] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD" }).format(amount);

  const formatBs = (amount: number) => {
    if (!currentRate) return "—";
    const bs = amount * currentRate.rate;
    return `Bs ${new Intl.NumberFormat("es-VE").format(bs)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 -m-4 lg:-m-8 p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-luxury text-amber-100">Ingresos por Reservaciones</h1>
          <p className="text-stone-400 font-cursive text-lg">Control de pagos recibidos</p>
        </div>
        <Button variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Date Filters */}
      <Card className="bg-stone-900/50 border-amber-500/20 p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-stone-400 text-sm mb-1 block">Desde</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-stone-800/50 border-stone-700 text-amber-100 w-40"
            />
          </div>
          <div>
            <label className="text-stone-400 text-sm mb-1 block">Hasta</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-stone-800/50 border-stone-700 text-amber-100 w-40"
            />
          </div>
          {currentRate && (
            <div className="ml-auto text-right">
              <p className="text-stone-500 text-xs">Tasa actual</p>
              <p className="text-amber-400 font-semibold">
                1 USD = {currentRate.rate.toLocaleString("es-VE")} Bs
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border-emerald-500/30 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-emerald-300/70 text-sm font-medium">Total Ingresos</p>
              <p className="text-3xl font-bold text-emerald-100 mt-1">{formatCurrency(totalIncome)}</p>
              <p className="text-emerald-400/60 text-sm mt-1">{formatBs(totalIncome)}</p>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-900/40 to-amber-800/20 border-amber-500/30 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-amber-300/70 text-sm font-medium">Por Reservaciones</p>
              <p className="text-3xl font-bold text-amber-100 mt-1">{formatCurrency(reservationIncome)}</p>
              <p className="text-amber-400/60 text-sm mt-1">{formatBs(reservationIncome)}</p>
            </div>
            <div className="p-3 bg-amber-500/20 rounded-xl">
              <Bed className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-500/30 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-300/70 text-sm font-medium">Otros Ingresos</p>
              <p className="text-3xl font-bold text-blue-100 mt-1">{formatCurrency(otherIncome)}</p>
              <p className="text-blue-400/60 text-sm mt-1">{formatBs(otherIncome)}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Payment Methods Breakdown */}
      <Card className="bg-stone-900/50 border-amber-500/20 p-6">
        <h2 className="text-lg font-luxury text-amber-200 mb-4">Por Método de Pago</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(PAYMENT_METHODS).map(([key, { label, icon: Icon }]) => (
            <div key={key} className="bg-stone-800/50 rounded-xl p-4 text-center">
              <Icon className="w-5 h-5 text-amber-400 mx-auto mb-2" />
              <p className="text-stone-400 text-xs">{label}</p>
              <p className="text-amber-100 font-semibold">{formatCurrency(byPaymentMethod[key] || 0)}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="bg-stone-900/50 border-amber-500/20 overflow-hidden">
        <div className="p-4 border-b border-stone-800">
          <h2 className="text-lg font-luxury text-amber-200">Detalle de Ingresos</h2>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center text-stone-500">Cargando...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-stone-500">No hay ingresos en este período</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase">Descripción</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase">Reservación</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase">Método</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-stone-400 uppercase">Monto USD</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-stone-400 uppercase">Monto Bs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {transactions.map((t) => {
                  const method = PAYMENT_METHODS[t.payment_method];
                  const MethodIcon = method?.icon || DollarSign;
                  return (
                    <tr key={t.id} className="hover:bg-stone-800/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-stone-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-stone-500" />
                          {new Date(t.transaction_date).toLocaleDateString("es-VE")}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-amber-100">{t.description}</p>
                        {t.notes && <p className="text-xs text-stone-500">{t.notes}</p>}
                      </td>
                      <td className="px-4 py-3">
                        {t.reservation_id ? (
                          <div className="flex items-center gap-2">
                            <Link2 className="w-4 h-4 text-amber-500" />
                            <div>
                              <p className="text-sm text-amber-200">{t.guest_name || `Reserva #${t.reservation_id}`}</p>
                              <p className="text-xs text-stone-500">
                                {t.room_code && `Hab. ${t.room_code}`}
                                {t.reservation_check_in && ` · ${new Date(t.reservation_check_in).toLocaleDateString("es-VE")}`}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-stone-500 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <MethodIcon className="w-4 h-4 text-amber-400" />
                          <span className="text-sm text-stone-300">{method?.label || t.payment_method}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-emerald-400 font-semibold">{formatCurrency(t.amount)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-stone-400">{formatBs(t.amount)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
