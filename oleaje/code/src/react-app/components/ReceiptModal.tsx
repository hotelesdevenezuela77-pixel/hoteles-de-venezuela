import { X, Printer } from 'lucide-react';
import { OrderItem, CustomerData } from './OrderPanel';

interface ReceiptModalProps {
  items: OrderItem[];
  tableNumber: number;
  zoneName: string;
  orderId: number | null;
  customerData?: CustomerData;
  onClose: () => void;
}

export function ReceiptModal({ items, tableNumber, zoneName, orderId, customerData, onClose }: ReceiptModalProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const serviceCharge = subtotal * 0.10;
  const total = subtotal + serviceCharge;

  const now = new Date();
  const dateStr = now.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header Actions */}
        <div className="flex items-center justify-between p-4 border-b border-border print:hidden">
          <h3 className="font-semibold">Recibo</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-[hsl(var(--ocean))] text-white hover:bg-[hsl(187,70%,35%)] transition-colors"
            >
              <Printer size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-6 bg-white" id="receipt-content">
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <img 
              src="https://019d7ecf-79c1-7d77-a05b-1ab65717da61.mochausercontent.com/oleaje-logo.jpg" 
              alt="Oleaje"
              className="h-16 mx-auto mb-3"
            />
            <p className="text-sm text-muted-foreground">El Placer de estar en el mar</p>
          </div>

          {/* Order Info */}
          <div className="border-t border-dashed border-border pt-4 mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Fecha:</span>
              <span>{dateStr}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Hora:</span>
              <span>{timeStr}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Mesa:</span>
              <span>{tableNumber} - {zoneName}</span>
            </div>
            {orderId && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Orden:</span>
                <span>#{orderId}</span>
              </div>
            )}
          </div>

          {/* Customer Info */}
          {customerData && (customerData.name || customerData.phone || customerData.cedula) && (
            <div className="border-t border-dashed border-border pt-4 mb-4">
              <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Cliente</p>
              {customerData.name && (
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Nombre:</span>
                  <span>{customerData.name}</span>
                </div>
              )}
              {customerData.phone && (
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Teléfono:</span>
                  <span>{customerData.phone}</span>
                </div>
              )}
              {customerData.cedula && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cédula:</span>
                  <span>{customerData.cedula}</span>
                </div>
              )}
            </div>
          )}

          {/* Items */}
          <div className="border-t border-dashed border-border pt-4 mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="text-left font-normal pb-2">Cant.</th>
                  <th className="text-left font-normal pb-2">Descripción</th>
                  <th className="text-right font-normal pb-2">Precio</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-1">{item.quantity}</td>
                    <td className="py-1">{item.name}</td>
                    <td className="py-1 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t border-dashed border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Servicio (10%)</span>
              <span>${serviceCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
              <span>TOTAL</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 pt-4 border-t border-dashed border-border">
            <p className="text-sm font-medium">¡Gracias por su visita!</p>
            <p className="text-xs text-muted-foreground mt-1">Oleaje - Restaurante & Bar</p>
          </div>
        </div>

        {/* Close Button */}
        <div className="p-4 border-t border-border print:hidden">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-lg bg-muted hover:bg-muted/80 font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
