import { useState } from 'react';
import { X, User, Phone, Home, Send } from 'lucide-react';

const LOGO_URL = 'https://019dadb9-b77e-7d54-b090-02f504b20f6e.mochausercontent.com/PERLA-NEGRA.png';

const roomTypes = [
  { id: 'Familiar', label: 'Habitación Familiar (4 personas)' },
  { id: 'Familiar Grande', label: 'Habitación Familiar Grande (6 personas)' },
  { id: 'Extrafamiliar', label: 'Habitación Extrafamiliar (8 personas)' },
  { id: 'Ejecutiva', label: 'Habitación Ejecutiva (2 personas)' },
  { id: 'No estoy seguro', label: 'No estoy seguro / Quiero opciones' },
];

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; phone: string; roomType: string }) => void;
}

export function LeadCaptureModal({ isOpen, onClose, onSubmit }: LeadCaptureModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [roomType, setRoomType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !roomType) return;
    
    setIsSubmitting(true);
    try {
      onSubmit({ name: name.trim(), phone: phone.trim(), roomType });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = name.trim() && phone.trim() && roomType;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header - Dark with gold accent */}
        <div className="relative bg-stone-900 px-6 py-5 border-b border-amber-500/30">
          {/* Gold gradient line at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20">
              <img src={LOGO_URL} alt="Perla Negra" className="w-full h-full rounded-full object-contain bg-stone-900 p-1" />
            </div>
            <div className="flex-1">
              <h3 className="font-luxury text-xl text-amber-400 font-semibold">¡Antes de continuar!</h3>
              <p className="font-cursive text-stone-400 text-sm italic">Déjanos tus datos</p>
            </div>
            <button 
              onClick={onClose}
              className="text-stone-500 hover:text-amber-400 transition-colors p-2 rounded-full hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <p className="mt-4 font-cursive text-stone-300 text-sm leading-relaxed">
            Para brindarte la mejor atención, necesitamos saber cómo contactarte.
          </p>
        </div>

        {/* Form - Dark elegant style */}
        <form onSubmit={handleSubmit} className="bg-stone-800 p-6 space-y-5">
          {/* Name field */}
          <div>
            <label className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-2">
              <User className="w-4 h-4" />
              Tu nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="¿Cómo te llamas?"
              className="w-full px-4 py-3.5 rounded-2xl bg-stone-900 border-2 border-stone-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-white placeholder:text-stone-500 font-cursive text-lg transition-all"
            />
          </div>

          {/* Phone field */}
          <div>
            <label className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-2">
              <Phone className="w-4 h-4" />
              Tu teléfono / WhatsApp
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+58 414 123 4567"
              className="w-full px-4 py-3.5 rounded-2xl bg-stone-900 border-2 border-stone-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-white placeholder:text-stone-500 font-cursive text-lg transition-all"
            />
          </div>

          {/* Room type dropdown */}
          <div>
            <label className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-2">
              <Home className="w-4 h-4" />
              ¿Qué tipo de alojamiento te interesa?
            </label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-stone-900 border-2 border-stone-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-white font-cursive text-lg transition-all appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23d97706'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1.5rem',
              }}
            >
              <option value="" className="bg-stone-900 text-stone-500">Selecciona una opción</option>
              {roomTypes.map((room) => (
                <option key={room.id} value={room.id} className="bg-stone-900 text-white">
                  {room.label}
                </option>
              ))}
            </select>
          </div>

          {/* Submit button - Gold gradient */}
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full py-4 rounded-full font-luxury font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:via-yellow-300 hover:to-amber-400 text-stone-900 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50"
          >
            <Send className="w-5 h-5" />
            Continuar a WhatsApp
          </button>
        </form>

        {/* Footer */}
        <div className="bg-stone-900 px-6 py-3 border-t border-stone-700">
          <p className="text-xs text-stone-500 text-center font-cursive">
            🔒 Tus datos están seguros. Solo los usaremos para contactarte.
          </p>
        </div>
      </div>
    </div>
  );
}
