import { useState } from 'react';
import { X, Bed, Users, Home, Building2, MessageCircle, Send } from 'lucide-react';

const WHATSAPP_ICON = 'https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/w-removebg-preview.png';
const LOGO_URL = 'https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/2-01.png';

const roomTypes = [
  { 
    id: 'Matrimonial', 
    label: 'Habitación Matrimonial', 
    description: '2 personas • Cama doble',
    icon: Bed
  },
  { 
    id: 'Triple', 
    label: 'Habitación Triple', 
    description: '3 personas • Múltiples camas',
    icon: Users
  },
  { 
    id: 'Cuádruple', 
    label: 'Habitación Cuádruple', 
    description: '4 personas • Ideal familias',
    icon: Users
  },
  { 
    id: 'Apartamento', 
    label: 'Apartamento', 
    description: '5 personas • Cocina equipada',
    icon: Home
  },
  { 
    id: 'No estoy seguro', 
    label: 'No estoy seguro', 
    description: 'Quiero conocer opciones',
    icon: Building2
  }
];

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRoom: (roomType: string) => void;
}

export function WhatsAppModal({ isOpen, onClose, onSelectRoom }: WhatsAppModalProps) {
  const [customMessage, setCustomMessage] = useState('');

  if (!isOpen) return null;

  const handleCustomSubmit = () => {
    if (customMessage.trim()) {
      onSelectRoom(`Consulta: ${customMessage.trim()}`);
      setCustomMessage('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* WhatsApp-style header */}
        <div className="bg-[#075E54] px-6 py-4 flex items-center gap-4">
          <img src={LOGO_URL} alt="Logo" className="w-12 h-12 rounded-full bg-white p-1" />
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">Aparto Posada del Mar</h3>
            <p className="text-green-200 text-sm">En línea • Respuesta inmediata</p>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Chat-style content */}
        <div className="bg-[#ECE5DD] p-4">
          {/* Message bubble from posada */}
          <div className="bg-white rounded-lg rounded-tl-none p-4 shadow-sm max-w-[90%] mb-4">
            <p className="text-gray-800 text-sm leading-relaxed">
              ¡Hola! 👋 Gracias por contactarnos.
            </p>
            <p className="text-gray-800 text-sm leading-relaxed mt-2">
              Para atenderle mejor, ¿qué tipo de habitación le interesa?
            </p>
            <span className="text-[10px] text-gray-400 float-right mt-1">
              {new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Room type options */}
        <div className="p-4 bg-white border-t border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 text-center">
            Seleccione una opción
          </p>
          <div className="space-y-2">
            {roomTypes.map((room) => (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-[#25D366]/10 border border-gray-200 hover:border-[#25D366] transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-full bg-[#25D366]/10 group-hover:bg-[#25D366]/20 flex items-center justify-center transition-colors">
                  <room.icon className="w-5 h-5 text-[#25D366]" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-800 text-sm">{room.label}</p>
                  <p className="text-xs text-gray-500">{room.description}</p>
                </div>
                <img src={WHATSAPP_ICON} alt="" className="w-6 h-6 opacity-50 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>

          {/* Custom message input */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 text-center">
              O escriba su consulta
            </p>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
                  placeholder="Ej: ¿Tienen disponibilidad para Semana Santa?"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 outline-none text-sm text-gray-800 placeholder:text-gray-400"
                />
              </div>
              <button
                onClick={handleCustomSubmit}
                disabled={!customMessage.trim()}
                className="px-4 py-3 rounded-xl bg-[#25D366] hover:bg-[#128C7E] disabled:bg-gray-300 disabled:cursor-not-allowed text-white transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 text-center">
            🔒 Su información está segura y no será compartida
          </p>
        </div>
      </div>
    </div>
  );
}
