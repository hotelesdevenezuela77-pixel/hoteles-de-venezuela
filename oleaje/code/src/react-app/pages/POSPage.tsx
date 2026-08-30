import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { CategoryTabs } from '@/react-app/components/CategoryTabs';
import { ProductGrid } from '@/react-app/components/ProductGrid';
import { OrderPanel, OrderItem, CustomerData } from '@/react-app/components/OrderPanel';
import { ReceiptModal } from '@/react-app/components/ReceiptModal';
import { Search, ArrowLeft, Loader2, ShoppingCart, X } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  category_slug: string;
}

const zoneNames: Record<string, string> = {
  'pergolas': 'Pérgolas',
  'patio-central': 'Patio Central',
  'vip-grande': 'VIP Grande',
  'vip-pequeno': 'VIP Pequeño',
  'terraza': 'Terraza',
  'playa': 'Playa',
};

export default function POSPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const zone = searchParams.get('zone') || 'pergolas';
  const table = searchParams.get('table') ? parseInt(searchParams.get('table')!) : 1;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderId, setOrderId] = useState<number | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerData>({ name: '', phone: '', cedula: '' });
  const [showOrderPanel, setShowOrderPanel] = useState(false);

  useEffect(() => {
    loadData();
  }, [zone, table]);

  const loadData = async () => {
    try {
      // Load products
      const productsRes = await fetch('/api/products');
      const productsData = await productsRes.json();
      setProducts(productsData);

      // Check for existing open order for this table
      const ordersRes = await fetch(`/api/orders?status=open&zone=${zone}`);
      const ordersData = await ordersRes.json();
      const existingOrder = ordersData.find(
        (o: any) => o.zone_slug === zone && o.table_number === table
      );

      if (existingOrder) {
        setOrderId(existingOrder.id);
        // Load order items
        const orderRes = await fetch(`/api/orders/${existingOrder.id}`);
        const orderData = await orderRes.json();
        if (orderData.items) {
          setOrderItems(
            orderData.items.map((item: any) => ({
              id: String(item.product_id || item.id),
              name: item.product_name,
              price: item.unit_price,
              quantity: item.quantity,
              category: '',
              dbItemId: item.id,
            }))
          );
        }
        // Load customer data
        setCustomerData({
          name: orderData.customer_name || '',
          phone: orderData.customer_phone || '',
          cedula: orderData.customer_cedula || '',
        });
      } else {
        setCustomerData({ name: '', phone: '', cedula: '' });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Convert products to menu items format
  const menuItems = useMemo(() => {
    return products.map((p) => ({
      id: String(p.id),
      name: p.name,
      price: p.price,
      category: p.category_slug || 'all',
    }));
  }, [products]);

  const filteredItems = useMemo(() => {
    let items = menuItems;
    
    if (activeCategory !== 'all') {
      items = items.filter((item) => item.category === activeCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter((item) => 
        item.name.toLowerCase().includes(query)
      );
    }
    
    return items;
  }, [menuItems, activeCategory, searchQuery]);

  const handleAddItem = async (item: { id: string; name: string; price: number; category: string }) => {
    // Update local state first
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });

    // Then save to backend
    try {
      let currentOrderId = orderId;

      // Create order if it doesn't exist
      if (!currentOrderId) {
        const createRes = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            zone_slug: zone,
            table_number: table,
          }),
        });
        const newOrder = await createRes.json();
        currentOrderId = newOrder.id;
        setOrderId(currentOrderId);
      }

      // Add item to order
      await fetch(`/api/orders/${currentOrderId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: parseInt(item.id),
          product_name: item.name,
          quantity: 1,
          unit_price: item.price,
        }),
      });

      // Reload order to get updated items with proper IDs
      const orderRes = await fetch(`/api/orders/${currentOrderId}`);
      const orderData = await orderRes.json();
      if (orderData.items) {
        setOrderItems(
          orderData.items.map((dbItem: any) => ({
            id: String(dbItem.product_id || dbItem.id),
            name: dbItem.product_name,
            price: dbItem.unit_price,
            quantity: dbItem.quantity,
            category: '',
            dbItemId: dbItem.id,
          }))
        );
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    const item = orderItems.find((i) => i.id === itemId);
    if (!item || !orderId) return;

    if (quantity <= 0) {
      setOrderItems((prev) => prev.filter((i) => i.id !== itemId));
      if ((item as any).dbItemId) {
        await fetch(`/api/orders/${orderId}/items/${(item as any).dbItemId}`, {
          method: 'DELETE',
        });
      }
    } else {
      setOrderItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
      );
      if ((item as any).dbItemId) {
        await fetch(`/api/orders/${orderId}/items/${(item as any).dbItemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity }),
        });
      }
    }
  };

  const handleClearOrder = async () => {
    setOrderItems([]);
    setCustomerData({ name: '', phone: '', cedula: '' });
    if (orderId) {
      // Delete all items
      for (const item of orderItems) {
        if ((item as any).dbItemId) {
          await fetch(`/api/orders/${orderId}/items/${(item as any).dbItemId}`, {
            method: 'DELETE',
          });
        }
      }
    }
  };

  const handleCustomerChange = async (data: CustomerData) => {
    setCustomerData(data);
    if (orderId) {
      setSaving(true);
      try {
        await fetch(`/api/orders/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_name: data.name,
            customer_phone: data.phone,
            customer_cedula: data.cedula,
          }),
        });
      } catch (error) {
        console.error('Error saving customer data:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  const handlePrint = () => {
    setShowReceipt(true);
  };

  const handleCharge = async () => {
    if (orderId) {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' }),
      });
      setShowReceipt(true);
    }
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    if (orderId) {
      // Navigate back to table selection
      navigate('/mesas');
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--ocean))]" />
          <span className="text-muted-foreground">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Navigation */}
      <header className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3 bg-card border-b border-border">
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => navigate('/mesas')}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <img 
              src="https://019d7ecf-79c1-7d77-a05b-1ab65717da61.mochausercontent.com/oleaje-logo.jpg" 
              alt="Oleaje"
              className="h-8 sm:h-11 w-auto"
            />
          </div>
        </div>

        {/* Search - Hidden on mobile, visible on sm+ */}
        <div className="hidden sm:block flex-1 max-w-md mx-4 lg:mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted border border-border focus:border-[hsl(var(--ocean))] focus:ring-2 focus:ring-[hsl(var(--ocean))]/20 outline-none transition-all text-sm"
            />
          </div>
        </div>

        {/* Table Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-[hsl(var(--ocean-light))] border border-[hsl(var(--ocean))]/30">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-[hsl(var(--ocean))] text-white flex items-center justify-center font-bold text-xs sm:text-sm">
              {table}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-muted-foreground">Mesa</p>
              <p className="text-sm font-semibold">{zoneNames[zone] || zone}</p>
            </div>
          </div>
          {saving && (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          )}
          
          {/* Mobile Cart Button */}
          <button
            onClick={() => setShowOrderPanel(true)}
            className="lg:hidden relative p-2 rounded-lg bg-[hsl(var(--ocean))] text-white"
          >
            <ShoppingCart size={20} />
            {orderItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full text-xs font-bold flex items-center justify-center">
                {orderItems.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Search Bar */}
      <div className="sm:hidden px-3 py-2 bg-card border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-muted border border-border focus:border-[hsl(var(--ocean))] focus:ring-2 focus:ring-[hsl(var(--ocean))]/20 outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Products Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <CategoryTabs 
            activeCategory={activeCategory} 
            onCategoryChange={setActiveCategory} 
          />
          <div className="flex-1 overflow-y-auto">
            <ProductGrid 
              items={filteredItems} 
              onAddItem={handleAddItem} 
            />
          </div>
        </div>

        {/* Order Panel - Desktop */}
        <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0">
          <OrderPanel
            items={orderItems}
            tableNumber={table}
            zoneName={zoneNames[zone] || zone}
            customerData={customerData}
            onUpdateQuantity={handleUpdateQuantity}
            onClearOrder={handleClearOrder}
            onCustomerChange={handleCustomerChange}
            onPrint={handlePrint}
            onCharge={handleCharge}
          />
        </div>
      </div>

      {/* Mobile Order Panel Overlay */}
      {showOrderPanel && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowOrderPanel(false)}
          />
          {/* Panel */}
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-card shadow-xl animate-in slide-in-from-right duration-300">
            <button
              onClick={() => setShowOrderPanel(false)}
              className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-muted hover:bg-muted/80"
            >
              <X size={20} />
            </button>
            <OrderPanel
              items={orderItems}
              tableNumber={table}
              zoneName={zoneNames[zone] || zone}
              customerData={customerData}
              onUpdateQuantity={handleUpdateQuantity}
              onClearOrder={handleClearOrder}
              onCustomerChange={handleCustomerChange}
              onPrint={handlePrint}
              onCharge={handleCharge}
            />
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && (
        <ReceiptModal
          items={orderItems}
          tableNumber={table}
          zoneName={zoneNames[zone] || zone}
          orderId={orderId}
          customerData={customerData}
          onClose={handleCloseReceipt}
        />
      )}
    </div>
  );
}
