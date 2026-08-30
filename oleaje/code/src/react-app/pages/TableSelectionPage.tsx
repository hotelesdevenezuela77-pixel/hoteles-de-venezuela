import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { Users, Clock, LogOut, Loader2, BarChart3 } from 'lucide-react';
import { useAuth } from '@/react-app/contexts/AuthContext';

interface Table {
  id: number;
  table_number: number;
  capacity: number;
  status: string;
  zone_id: number;
  zone_name: string;
  zone_slug: string;
}

interface Zone {
  id: number;
  name: string;
  slug: string;
}

interface ActiveOrder {
  id: number;
  table_number: number;
  zone_slug: string;
  total: number;
  created_at: string;
  item_count?: number;
}

export default function TableSelectionPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [zones, setZones] = useState<Zone[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [activeZone, setActiveZone] = useState('pergolas');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [zonesRes, tablesRes, ordersRes] = await Promise.all([
        fetch('/api/zones'),
        fetch('/api/tables'),
        fetch('/api/orders?status=open'),
      ]);

      const zonesData = await zonesRes.json();
      const tablesData = await tablesRes.json();
      const ordersData = await ordersRes.json();

      setZones(zonesData);
      setTables(tablesData);
      setActiveOrders(ordersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentZoneTables = tables.filter((t) => t.zone_slug === activeZone);
  const currentZone = zones.find((z) => z.slug === activeZone);

  const getTableStatus = (table: Table) => {
    const hasOrder = activeOrders.some(
      (o) => o.zone_slug === table.zone_slug && o.table_number === table.table_number
    );
    if (hasOrder) return 'occupied';
    return table.status || 'available';
  };

  const getOrderForTable = (table: Table) => {
    return activeOrders.find(
      (o) => o.zone_slug === table.zone_slug && o.table_number === table.table_number
    );
  };

  const handleTableSelect = (zoneSlug: string, tableNumber: number) => {
    navigate(`/pos?zone=${zoneSlug}&table=${tableNumber}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-50 border-emerald-400 hover:bg-emerald-100';
      case 'occupied':
        return 'bg-amber-50 border-amber-400 hover:bg-amber-100';
      case 'reserved':
        return 'bg-slate-100 border-slate-300';
      default:
        return 'bg-muted border-border';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <span className="text-[10px] font-medium text-emerald-600 uppercase">Libre</span>;
      case 'occupied':
        return <span className="text-[10px] font-medium text-amber-600 uppercase">Ocupada</span>;
      case 'reserved':
        return <span className="text-[10px] font-medium text-slate-500 uppercase">Reservada</span>;
      default:
        return <span className="text-[10px] font-medium text-slate-500 uppercase">{status}</span>;
    }
  };

  const stats = {
    available: tables.filter((t) => getTableStatus(t) === 'available').length,
    occupied: tables.filter((t) => getTableStatus(t) === 'occupied').length,
    reserved: tables.filter((t) => getTableStatus(t) === 'reserved').length,
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--ocean))]" />
          <span className="text-muted-foreground">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          {/* Mobile: Logo + Actions */}
          <div className="flex items-center justify-between gap-2">
            <img 
              src="https://019d7ecf-79c1-7d77-a05b-1ab65717da61.mochausercontent.com/oleaje-logo.jpg" 
              alt="Oleaje"
              className="h-10 sm:h-14 w-auto"
            />

            {/* Stats - Hidden on mobile, visible on md+ */}
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{stats.available}</span> Libres
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{stats.occupied}</span> Ocupadas
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-300" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{stats.reserved}</span> Reservadas
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Link 
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-teal-600 text-white hover:bg-teal-700 transition-colors"
              >
                <BarChart3 size={16} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              <button 
                onClick={() => { logout(); navigate('/login'); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>

          {/* Mobile Stats Row */}
          <div className="flex md:hidden items-center justify-center gap-4 mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{stats.available}</span> Libres
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{stats.occupied}</span> Ocupadas
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{stats.reserved}</span> Reservadas
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Zone Tabs */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {zones.map((zone) => (
            <button
              key={zone.id}
              onClick={() => setActiveZone(zone.slug)}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                activeZone === zone.slug
                  ? 'bg-[hsl(var(--ocean))] text-white shadow-lg shadow-[hsl(var(--ocean))]/25'
                  : 'bg-white border border-border hover:border-[hsl(var(--ocean))]/50 text-foreground'
              }`}
            >
              {zone.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tables Grid */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-4">
          {currentZoneTables.map((table) => {
            const status = getTableStatus(table);
            const order = getOrderForTable(table);
            
            return (
              <button
                key={table.id}
                onClick={() => status !== 'reserved' && handleTableSelect(table.zone_slug, table.table_number)}
                disabled={status === 'reserved'}
                className={`relative aspect-square rounded-xl sm:rounded-2xl border-2 p-2 sm:p-3 flex flex-col items-center justify-center transition-all duration-200 ${getStatusColor(status)} ${
                  status === 'reserved' ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                }`}
              >
                <span className="text-xl sm:text-2xl font-bold text-foreground">{table.table_number}</span>
                <div className="flex items-center gap-1 mt-0.5 sm:mt-1 text-muted-foreground">
                  <Users size={10} className="sm:w-3 sm:h-3" />
                  <span className="text-[10px] sm:text-xs">{table.capacity}</span>
                </div>
                <div className="mt-1 sm:mt-2">
                  {getStatusBadge(status)}
                </div>

                {/* Order info for occupied tables */}
                {status === 'occupied' && order && (
                  <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full">
                    ${order.total.toFixed(0)}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Occupied Tables Summary */}
        {activeOrders.filter((o) => o.zone_slug === activeZone).length > 0 && currentZone && (
          <div className="mt-6 sm:mt-8">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Mesas Activas - {currentZone.name}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {activeOrders
                .filter((o) => o.zone_slug === activeZone)
                .map((order) => (
                  <div
                    key={order.id}
                    onClick={() => handleTableSelect(order.zone_slug, order.table_number)}
                    className="bg-white rounded-xl border border-border p-4 cursor-pointer hover:shadow-md hover:border-[hsl(var(--ocean))]/50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                          <span className="text-lg font-bold text-amber-700">{order.table_number}</span>
                        </div>
                        <div>
                          <p className="font-semibold">Mesa {order.table_number}</p>
                          <p className="text-xs text-muted-foreground">Orden #{order.id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[hsl(var(--ocean))]">
                          ${order.total.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock size={10} />
                          <span>{formatTime(order.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
