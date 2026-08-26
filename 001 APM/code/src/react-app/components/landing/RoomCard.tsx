import { useState, useEffect, useRef, useCallback } from 'react';
import { Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/react-app/components/ui/button';

const WHATSAPP_ICON = 'https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/w-removebg-preview.png';

interface RoomDisplayItem {
  id: number;
  title: string;
  description: string;
  image: string;
  images: string[];
  capacity: number;
}

interface RoomCardProps {
  room: RoomDisplayItem;
  onReserve: (roomTitle: string) => void;
}

export function RoomCard({ room, onReserve }: RoomCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Combine main image with additional images, filter out empty strings
  const allImages = [room.image, ...room.images].filter(img => img && img.trim() !== '');
  const hasMultipleImages = allImages.length > 1;

  // Auto-rotation logic
  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    if (hasMultipleImages && !isPaused) {
      autoPlayRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
      }, 4000); // Change every 4 seconds
    }
  }, [hasMultipleImages, isPaused, allImages.length]);

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [startAutoPlay]);

  // Pause auto-rotation on touch/click, resume after 6 seconds
  const pauseAutoPlay = () => {
    setIsPaused(true);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    setTimeout(() => setIsPaused(false), 6000);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    pauseAutoPlay();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    pauseAutoPlay();
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const goToImage = (index: number) => {
    pauseAutoPlay();
    setCurrentImageIndex(index);
  };

  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-border/50">
      {/* Image Carousel */}
      <div className="relative h-72 sm:h-80 overflow-hidden">
        {/* Images */}
        <div 
          className="flex transition-transform duration-500 ease-out h-full"
          style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
        >
          {allImages.map((img, index) => (
            <img 
              key={index}
              src={img} 
              alt={`${room.title} - Foto ${index + 1}`}
              className="w-full h-full object-cover flex-shrink-0"
            />
          ))}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-sky-900/60 via-transparent to-transparent pointer-events-none" />
        
        {/* Navigation Arrows - Yellow/Green gradient like WhatsApp */}
        {hasMultipleImages && (
          <>
            <button
              onClick={prevImage}
              onTouchStart={pauseAutoPlay}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white flex items-center justify-center transition-all shadow-lg hover:scale-110 active:scale-95"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextImage}
              onTouchStart={pauseAutoPlay}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white flex items-center justify-center transition-all shadow-lg hover:scale-110 active:scale-95"
              aria-label="Foto siguiente"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Room type label */}
        <div className="absolute bottom-4 left-4 right-20">
          <h3 className="text-white text-2xl font-semibold tracking-tight">{room.title}</h3>
        </div>

        {/* Dots Indicator - Bottom right */}
        {hasMultipleImages && (
          <div className="absolute bottom-4 right-4 flex gap-1.5">
            {allImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  goToImage(index);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImageIndex 
                    ? 'bg-white w-4' 
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Ver foto ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Image counter badge */}
        {hasMultipleImages && (
          <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {currentImageIndex + 1} / {allImages.length}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Capacity */}
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-cyan-500" />
          <span className="font-medium text-foreground">Hasta {room.capacity} personas</span>
        </div>

        {/* Description */}
        <p className="text-muted-foreground mb-4 leading-relaxed min-h-[60px]">
          {room.description}
        </p>

        {/* CTA */}
        <Button 
          onClick={() => onReserve(room.title)}
          className="w-full gradient-gold text-white rounded-full transition-all duration-300 hover:scale-105 border-0 flex items-center justify-center gap-2"
        >
          <img src={WHATSAPP_ICON} alt="WhatsApp" className="w-5 h-5 whatsapp-pulse" />
          Reservar
        </Button>
      </div>
    </div>
  );
}
