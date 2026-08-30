import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Card } from "@/react-app/components/ui/card";

interface FinancialChartsProps {
  incomeByMethod: Record<string, number>;
  expensesByCategory: Record<string, number>;
  totalIncome: number;
  totalExpenses: number;
  dailyTrends: Array<{ date: string; income: number; expenses: number }>;
}

const COLORS = {
  income: "#10b981",
  expenses: "#ef4444",
  methods: ["#f59e0b", "#d97706", "#b45309", "#92400e", "#78350f"],
  categories: ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e", "#14b8a6", "#0ea5e9", "#8b5cf6"],
};

export default function FinancialCharts({
  incomeByMethod,
  expensesByCategory,
  totalIncome,
  totalExpenses,
  dailyTrends,
}: FinancialChartsProps) {
  // Prepare data for income vs expenses bar chart
  const comparisonData = [
    { name: "Ingresos", value: totalIncome, fill: COLORS.income },
    { name: "Gastos", value: totalExpenses, fill: COLORS.expenses },
  ];

  // Prepare data for payment methods pie chart
  const methodsData = Object.entries(incomeByMethod).map(([name, value], index) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    fill: COLORS.methods[index % COLORS.methods.length],
  }));

  // Prepare data for expenses by category pie chart
  const categoriesData = Object.entries(expensesByCategory).map(([name, value], index) => ({
    name,
    value,
    fill: COLORS.categories[index % COLORS.categories.length],
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-stone-200">
          <p className="font-medium text-stone-800">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-stone-200">
          <p className="font-medium text-stone-800">{payload[0].name}</p>
          <p className="text-sm text-stone-600">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Income vs Expenses Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 rounded-3xl border-stone-200">
          <h3 className="text-lg font-luxury font-semibold text-stone-800 mb-4">
            Ingresos vs Gastos
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis type="number" tickFormatter={(v) => `$${v}`} stroke="#78716c" />
                <YAxis type="category" dataKey="name" stroke="#78716c" width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Daily/Weekly Trend Line Chart */}
        <Card className="p-6 rounded-3xl border-stone-200">
          <h3 className="text-lg font-luxury font-semibold text-stone-800 mb-4">
            Tendencia de Flujo de Caja
          </h3>
          <div className="h-64">
            {dailyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="date" stroke="#78716c" fontSize={12} />
                  <YAxis tickFormatter={(v) => `$${v}`} stroke="#78716c" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="income"
                    name="Ingresos"
                    stroke={COLORS.income}
                    strokeWidth={3}
                    dot={{ fill: COLORS.income, strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    name="Gastos"
                    stroke={COLORS.expenses}
                    strokeWidth={3}
                    dot={{ fill: COLORS.expenses, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-stone-500 font-cursive">
                Sin datos de tendencia disponibles
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Pie Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income by Payment Method */}
        <Card className="p-6 rounded-3xl border-stone-200">
          <h3 className="text-lg font-luxury font-semibold text-stone-800 mb-4">
            Distribución de Ingresos por Método
          </h3>
          <div className="h-64">
            {methodsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={methodsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {methodsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-stone-500 font-cursive">
                Sin datos de métodos de pago
              </div>
            )}
          </div>
        </Card>

        {/* Expenses by Category */}
        <Card className="p-6 rounded-3xl border-stone-200">
          <h3 className="text-lg font-luxury font-semibold text-stone-800 mb-4">
            Distribución de Gastos por Categoría
          </h3>
          <div className="h-64">
            {categoriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoriesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoriesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-stone-500 font-cursive">
                Sin datos de gastos por categoría
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
