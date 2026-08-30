import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, TrendingUp, DollarSign, Users, Award, Calendar } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

interface DailySummary {
  total_orders: number;
  total_subtotal: number;
  total_service: number;
  total_sales: number;
  service_points: number;
}

interface ZoneSales {
  zone_slug: string;
  order_count: number;
  subtotal: number;
  service: number;
  total: number;
}

interface TopProduct {
  product_name: string;
  total_quantity: number;
  total_revenue: number;
}

interface HourlySale {
  hour: string;
  order_count: number;
  total_sales: number;
}

const ZONE_NAMES: Record<string, string> = {
  'pergolas': 'Pérgolas',
  'patio-central': 'Patio Central',
  'vip-grande': 'VIP Grande',
  'vip-pequeno': 'VIP Pequeño',
  'terraza': 'Terraza',
  'playa': 'Playa'
};

const COLORS = ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4', '#ccfbf1'];

export default function DashboardPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [zoneSales, setZoneSales] = useState<ZoneSales[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [hourlySales, setHourlySales] = useState<HourlySale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, [date]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [dailyRes, zoneRes, productsRes, hourlyRes] = await Promise.all([
        fetch(`/api/reports/daily?date=${date}`),
        fetch(`/api/reports/by-zone?date=${date}`),
        fetch(`/api/reports/top-products?date=${date}&limit=8`),
        fetch(`/api/reports/hourly?date=${date}`)
      ]);

      const dailyData = await dailyRes.json();
      setSummary(dailyData.summary);

      const zoneData = await zoneRes.json();
      setZoneSales(zoneData);

      const productsData = await productsRes.json();
      setTopProducts(productsData);

      const hourlyData = await hourlyRes.json();
      setHourlySales(hourlyData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-VE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const zoneChartData = zoneSales.map(z => ({
    name: ZONE_NAMES[z.zone_slug] || z.zone_slug,
    ventas: z.total,
    ordenes: z.order_count
  }));

  const productChartData = topProducts.map(p => ({
    name: p.product_name.length > 15 ? p.product_name.substring(0, 15) + '...' : p.product_name,
    cantidad: p.total_quantity,
    ingresos: p.total_revenue
  }));

  const hourlyChartData = hourlySales.map(h => ({
    hora: `${h.hour}:00`,
    ventas: h.total_sales,
    ordenes: h.order_count
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-teal-700/30 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link 
              to="/mesas" 
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400 transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-teal-400/80 text-xs sm:text-sm hidden sm:block">Oleaje - El Placer de estar en el Mar</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <Calendar className="text-teal-400 hidden sm:block" size={20} />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-slate-800 border border-teal-700/50 rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Date Display */}
        <div className="text-center">
          <p className="text-teal-300 text-sm sm:text-lg capitalize">{formatDate(date)}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <SummaryCard
                icon={<DollarSign className="text-emerald-400" size={28} />}
                label="Ventas Totales"
                value={formatCurrency(summary?.total_sales || 0)}
                bgColor="from-emerald-600/20 to-emerald-800/20"
                borderColor="border-emerald-500/30"
              />
              <SummaryCard
                icon={<Users className="text-blue-400" size={28} />}
                label="Órdenes del Día"
                value={summary?.total_orders?.toString() || '0'}
                bgColor="from-blue-600/20 to-blue-800/20"
                borderColor="border-blue-500/30"
              />
              <SummaryCard
                icon={<TrendingUp className="text-amber-400" size={28} />}
                label="Servicio (10%)"
                value={formatCurrency(summary?.total_service || 0)}
                bgColor="from-amber-600/20 to-amber-800/20"
                borderColor="border-amber-500/30"
              />
              <SummaryCard
                icon={<Award className="text-purple-400" size={28} />}
                label="Puntos de Servicio"
                value={(summary?.service_points || 0).toFixed(2)}
                subtitle="÷25 del servicio"
                bgColor="from-purple-600/20 to-purple-800/20"
                borderColor="border-purple-500/30"
              />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Hourly Sales */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-teal-700/30 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Ventas por Hora</h3>
                {hourlyChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={hourlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="hora" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #0d9488',
                          borderRadius: '8px'
                        }}
                        formatter={(value, name) => [
                          name === 'ventas' ? formatCurrency(Number(value)) : value,
                          name === 'ventas' ? 'Ventas' : 'Órdenes'
                        ]}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="ventas" 
                        stroke="#14b8a6" 
                        strokeWidth={3}
                        dot={{ fill: '#14b8a6', strokeWidth: 2 }}
                        name="Ventas"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="ordenes" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        dot={{ fill: '#f59e0b', strokeWidth: 2 }}
                        name="Órdenes"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState message="No hay ventas registradas para esta fecha" />
                )}
              </div>

              {/* Sales by Zone */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-teal-700/30 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Ventas por Zona</h3>
                {zoneChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={zoneChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#14b8a6"
                        dataKey="ventas"
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        labelLine={{ stroke: '#94a3b8' }}
                      >
                        {zoneChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #0d9488',
                          borderRadius: '8px'
                        }}
                        formatter={(value) => [formatCurrency(Number(value)), 'Ventas']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState message="No hay ventas por zona para esta fecha" />
                )}
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Top Products */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-teal-700/30 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Productos Más Vendidos</h3>
                {productChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={productChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        stroke="#94a3b8" 
                        fontSize={9}
                        width={90}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #0d9488',
                          borderRadius: '8px'
                        }}
                        formatter={(value, name) => [
                          name === 'ingresos' ? formatCurrency(Number(value)) : value,
                          name === 'cantidad' ? 'Cantidad' : 'Ingresos'
                        ]}
                      />
                      <Bar dataKey="cantidad" fill="#14b8a6" radius={[0, 4, 4, 0]} name="Cantidad" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState message="No hay productos vendidos para esta fecha" />
                )}
              </div>

              {/* Zone Details Table */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-teal-700/30 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Detalle por Zona</h3>
                {zoneSales.length > 0 ? (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[400px]">
                      <thead>
                        <tr className="text-left text-teal-400 text-xs sm:text-sm border-b border-slate-700">
                          <th className="pb-2 sm:pb-3 pl-4 sm:pl-0">Zona</th>
                          <th className="pb-2 sm:pb-3 text-center">Órdenes</th>
                          <th className="pb-2 sm:pb-3 text-right">Subtotal</th>
                          <th className="pb-2 sm:pb-3 text-right">Servicio</th>
                          <th className="pb-2 sm:pb-3 text-right pr-4 sm:pr-0">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {zoneSales.map((zone, idx) => (
                          <tr key={idx} className="border-b border-slate-700/50 text-slate-300 text-xs sm:text-sm">
                            <td className="py-2 sm:py-3 font-medium text-white pl-4 sm:pl-0">
                              {ZONE_NAMES[zone.zone_slug] || zone.zone_slug}
                            </td>
                            <td className="py-2 sm:py-3 text-center">{zone.order_count}</td>
                            <td className="py-2 sm:py-3 text-right">{formatCurrency(zone.subtotal)}</td>
                            <td className="py-2 sm:py-3 text-right text-amber-400">{formatCurrency(zone.service)}</td>
                            <td className="py-2 sm:py-3 text-right text-emerald-400 font-semibold pr-4 sm:pr-0">
                              {formatCurrency(zone.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="text-white font-bold text-xs sm:text-sm">
                          <td className="pt-3 sm:pt-4 pl-4 sm:pl-0">Total</td>
                          <td className="pt-3 sm:pt-4 text-center">
                            {zoneSales.reduce((sum, z) => sum + z.order_count, 0)}
                          </td>
                          <td className="pt-3 sm:pt-4 text-right">
                            {formatCurrency(zoneSales.reduce((sum, z) => sum + z.subtotal, 0))}
                          </td>
                          <td className="pt-3 sm:pt-4 text-right text-amber-400">
                            {formatCurrency(zoneSales.reduce((sum, z) => sum + z.service, 0))}
                          </td>
                          <td className="pt-3 sm:pt-4 text-right text-emerald-400 pr-4 sm:pr-0">
                            {formatCurrency(zoneSales.reduce((sum, z) => sum + z.total, 0))}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <EmptyState message="No hay datos de zonas para esta fecha" />
                )}
              </div>
            </div>

            {/* Top Products List */}
            {topProducts.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-teal-700/30 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Ranking de Productos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {topProducts.map((product, idx) => (
                    <div 
                      key={idx}
                      className="bg-slate-900/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-700/50 flex items-center gap-3 sm:gap-4"
                    >
                      <div className={`
                        w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-lg
                        ${idx === 0 ? 'bg-amber-500/20 text-amber-400' : 
                          idx === 1 ? 'bg-slate-400/20 text-slate-300' :
                          idx === 2 ? 'bg-orange-600/20 text-orange-400' :
                          'bg-teal-600/20 text-teal-400'}
                      `}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate text-sm sm:text-base">{product.product_name}</p>
                        <p className="text-slate-400 text-xs sm:text-sm">
                          {product.total_quantity} unid. · {formatCurrency(product.total_revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function SummaryCard({ 
  icon, 
  label, 
  value, 
  subtitle,
  bgColor, 
  borderColor 
}: { 
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <div className={`bg-gradient-to-br ${bgColor} backdrop-blur-sm rounded-xl sm:rounded-2xl border ${borderColor} p-3 sm:p-6`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-slate-400 text-xs sm:text-sm mb-0.5 sm:mb-1">{label}</p>
          <p className="text-xl sm:text-3xl font-bold text-white truncate">{value}</p>
          {subtitle && <p className="text-slate-500 text-[10px] sm:text-xs mt-0.5 sm:mt-1">{subtitle}</p>}
        </div>
        <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-slate-900/50 ml-2">
          {icon}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="h-[180px] sm:h-[220px] flex items-center justify-center">
      <p className="text-slate-500 text-center text-sm sm:text-base">{message}</p>
    </div>
  );
}
