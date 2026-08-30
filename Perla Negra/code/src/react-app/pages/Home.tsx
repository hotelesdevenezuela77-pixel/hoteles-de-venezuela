import { useRef, useState, useEffect } from 'react';
import { Navbar } from '@/react-app/components/landing/Navbar';
import { Hero } from '@/react-app/components/landing/Hero';
import { ExperienceSection } from '@/react-app/components/landing/ExperienceSection';
import { RoomsSection } from '@/react-app/components/landing/RoomsSection';
import { FacilitiesSection } from '@/react-app/components/landing/FacilitiesSection';
import { TestimonialsSection } from '@/react-app/components/landing/TestimonialsSection';
import { LocationSection } from '@/react-app/components/landing/LocationSection';
import { BookingForm } from '@/react-app/components/landing/BookingForm';
import { Footer } from '@/react-app/components/landing/Footer';
import { FloatingWhatsApp } from '@/react-app/components/landing/FloatingWhatsApp';
import { LeadCaptureModal } from '@/react-app/components/landing/LeadCaptureModal';
import { useSiteContent } from '@/react-app/hooks/useSiteContent';

export default function HomePage() {
  const bookingRef = useRef<HTMLDivElement>(null);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const siteContent = useSiteContent();

  const openLeadModal = () => {
    setIsLeadModalOpen(true);
  };

  const handleLeadSubmit = (data: { name: string; phone: string; roomType: string }) => {
    setIsLeadModalOpen(false);
    
    const phone = '584244242766';
    const message = encodeURIComponent(
      `¡Hola! Soy ${data.name}.\n\n` +
      `Me gustaría hacer una reservación en Posada Perla Negra.\n\n` +
      `🏠 Tipo de habitación: ${data.roomType}\n` +
      `📱 Mi teléfono: ${data.phone}\n\n` +
      `¿Podrían ayudarme con disponibilidad y precios?`
    );
    
    // Register as lead in CRM with all captured data
    fetch('/api/leads/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        source: 'Popup de Captura',
        room_type: data.roomType,
        name: data.name,
        phone: data.phone
      })
    }).catch(() => {}); // Fire and forget
    
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleReserve = (roomType: string) => {
    // When user clicks on a specific room card, open lead capture with room pre-selected
    // For now, go directly to WhatsApp with that room type and register lead
    const phone = '584244242766';
    const message = encodeURIComponent(
      `¡Hola! Me gustaría hacer una reservación en Posada Perla Negra.\n\n` +
      `🏠 Tipo de habitación: ${roomType}\n\n` +
      `¿Podrían ayudarme con disponibilidad y precios?`
    );
    
    // Register as lead in CRM with room type
    fetch('/api/leads/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        source: 'Tarjeta de Habitación',
        room_type: roomType
      })
    }).catch(() => {}); // Fire and forget
    
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Playfair+Display:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    // Add font-family to root
    document.documentElement.style.setProperty('--font-serif', '"Cormorant Garamond", serif');
  }, []);

  return (
    <div className="min-h-screen">
      <style>{`
        .font-serif {
          font-family: "Cormorant Garamond", serif;
        }
        .font-luxury {
          font-family: "Playfair Display", serif;
        }
        .font-cursive {
          font-family: "Cormorant Garamond", serif;
        }
      `}</style>
      <Navbar onReserveClick={openLeadModal} />
      <Hero onReserveClick={openLeadModal} content={siteContent.banner} />
      <ExperienceSection />
      <RoomsSection onReserve={handleReserve} content={siteContent.roomsSection} roomsDisplay={siteContent.roomsDisplay} />
      <FacilitiesSection facilities={siteContent.facilities} />
      <TestimonialsSection />
      <LocationSection />
      <BookingForm ref={bookingRef} />
      <Footer />
      <FloatingWhatsApp onClick={openLeadModal} />
      <LeadCaptureModal 
        isOpen={isLeadModalOpen} 
        onClose={() => setIsLeadModalOpen(false)}
        onSubmit={handleLeadSubmit}
      />
    </div>
  );
}
