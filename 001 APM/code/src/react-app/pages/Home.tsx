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
import { WhatsAppModal } from '@/react-app/components/landing/WhatsAppModal';
import { useSiteContent } from '@/react-app/hooks/useSiteContent';

export default function HomePage() {
  const bookingRef = useRef<HTMLDivElement>(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const siteContent = useSiteContent();

  const openWhatsAppModal = () => {
    setIsWhatsAppModalOpen(true);
  };

  const handleRoomSelection = (roomType: string) => {
    setIsWhatsAppModalOpen(false);
    
    const phone = '584144815321';
    const message = encodeURIComponent(
      `¡Hola! Me gustaría hacer una reservación en Aparto Posada del Mar.\n\n` +
      `🏠 Tipo de habitación: ${roomType}\n\n` +
      `¿Podrían ayudarme con disponibilidad y precios?`
    );
    
    // Register as lead in CRM with room type
    fetch('/api/leads/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        source: 'WhatsApp Clasificador',
        room_type: roomType
      })
    }).catch(() => {}); // Fire and forget
    
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleReserve = (roomType: string) => {
    // When user clicks on a specific room card, go directly to WhatsApp with that room type
    const phone = '584144815321';
    const message = encodeURIComponent(
      `¡Hola! Me gustaría hacer una reservación en Aparto Posada del Mar.\n\n` +
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
    link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap';
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
      `}</style>
      <Navbar onReserveClick={openWhatsAppModal} />
      <Hero onReserveClick={openWhatsAppModal} content={siteContent.banner} />
      <ExperienceSection />
      <RoomsSection onReserve={handleReserve} content={siteContent.roomsSection} roomsDisplay={siteContent.roomsDisplay} />
      <FacilitiesSection facilities={siteContent.facilities} />
      <TestimonialsSection />
      <LocationSection />
      <BookingForm ref={bookingRef} />
      <Footer />
      <FloatingWhatsApp onClick={openWhatsAppModal} />
      <WhatsAppModal 
        isOpen={isWhatsAppModalOpen} 
        onClose={() => setIsWhatsAppModalOpen(false)}
        onSelectRoom={handleRoomSelection}
      />
    </div>
  );
}
