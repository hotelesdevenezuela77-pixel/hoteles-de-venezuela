import { Minus, Plus, Trash2, User, Phone, CreditCard } from 'lucide-react';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity: number;
  dbItemId?: number;
}

export interface CustomerData {
  name: string;
  phone: string;
  cedula: string;
}

interface OrderPanelProps {
  items: OrderItem[];
  tableNumber: number | null;
  zoneName?: string;
  customerData?: CustomerData;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onClearOrder: () => void;
  onCustomerChange?: (data: CustomerData) => void;
  onPrint?: () => void;
  onCharge?: () => void;
}

export function OrderPanel({ 
  items, 
  tableNumber, 
  zoneName, 
  customerData = { name: '', phone: '', cedula: '' },
  onUpdateQuantity,
  onClearOrder,
  onCustomerChange,
  onPrint,
  onCharge,
}: OrderPanelProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const serviceCharge = subtotal * 0.10;
  const total = subtotal + serviceCharge;

  const handleCustomerFieldChange = (field: keyof CustomerData, value: string) => {
    if (onCustomerChange) {
      onCustomerChange({ ...customerData, [field]: value });
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-[hsl(var(--ocean))] to-[hsl(187,60%,35%)]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {tableNumber ? `Mesa ${tableNumber}` : 'Nueva Orden'}
            </h2>
            <p className="text-sm text-white/80">
              {zoneName && <span>{zoneName} • </span>}
              {items.length} {items.length === 1 ? 'producto' : 'productos'}
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={onClearOrder}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Customer Data */}
      {items.length > 0 && (
        <div className="p-3 border-b border-border bg-muted/30 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Datos del Cliente</p>
          <div className="space-y-2">
            <div className="relative">
              <User size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Nombre"
                value={customerData.name}
                onChange={(e) => handleCustomerFieldChange('name', e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-border bg-background focus:border-[hsl(var(--ocean))] focus:ring-1 focus:ring-[hsl(var(--ocean))]/20 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Phone size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="tel"
                  placeholder="Teléfono"
                  value={customerData.phone}
                  onChange={(e) => handleCustomerFieldChange('phone', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-border bg-background focus:border-[hsl(var(--ocean))] focus:ring-1 focus:ring-[hsl(var(--ocean))]/20 outline-none"
                />
              </div>
              <div className="relative">
                <CreditCard size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cédula"
                  value={customerData.cedula}
                  onChange={(e) => handleCustomerFieldChange('cedula', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-border bg-background focus:border-[hsl(var(--ocean))] focus:ring-1 focus:ring-[hsl(var(--ocean))]/20 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-sm">Agregue productos a la orden</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-lg bg-muted/50 border border-border/50"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-medium leading-tight flex-1 pr-2">{item.name}</h4>
                <span className="text-sm font-semibold text-[hsl(var(--ocean))]">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  ${item.price.toFixed(2)} c/u
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-md bg-background border border-border flex items-center justify-center hover:bg-accent transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-md bg-[hsl(var(--ocean))] text-white flex items-center justify-center hover:bg-[hsl(187,70%,35%)] transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totals */}
      <div className="border-t border-border p-4 space-y-3 bg-muted/30">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Servicio (10%)</span>
          <span>${serviceCharge.toFixed(2)}</span>
        </div>
        <div className="h-px bg-border" />
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-[hsl(var(--ocean))]">${total.toFixed(2)}</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button 
            onClick={onPrint}
            disabled={items.length === 0}
            className="px-4 py-3 rounded-lg border-2 border-border font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Imprimir
          </button>
          <button 
            onClick={onCharge}
            disabled={items.length === 0}
            className="px-4 py-3 rounded-lg bg-[hsl(var(--ocean))] text-white font-medium hover:bg-[hsl(187,70%,35%)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cobrar
          </button>
        </div>
      </div>
    </div>
  );
}
