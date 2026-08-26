const WHATSAPP_ICON = 'https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/w-removebg-preview.png';

interface FloatingWhatsAppProps {
  onClick: () => void;
}

export function FloatingWhatsApp({ onClick }: FloatingWhatsAppProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 gradient-gold text-white px-5 py-3 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center gap-2 group"
      aria-label="Reservar por WhatsApp"
    >
      <img 
        src={WHATSAPP_ICON} 
        alt="WhatsApp" 
        className="w-8 h-8 whatsapp-pulse" 
      />
      <span className="font-semibold text-lg">Reserva!</span>
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full gradient-gold opacity-50 blur-lg -z-10 group-hover:opacity-70 transition-opacity" />
    </button>
  );
}
