import { useState, useEffect } from 'react';

interface SiteContentItem {
  id: number;
  section: string;
  content_key: string;
  content_value: string;
  content_type: string;
}

interface BannerContent {
  imageUrl: string;
  title: string;
  subtitle: string;
  highlightText: string;
}

interface RoomsSectionContent {
  sectionTitle: string;
  sectionSubtitle: string;
  sectionDescription: string;
}

interface FacilityItem {
  id: number;
  name: string;
  description: string;
  image: string;
}

interface RoomDisplayItem {
  id: number;
  title: string;
  description: string;
  image: string;
  images: string[];
  capacity: number;
}

interface SiteContent {
  banner: BannerContent;
  roomsSection: RoomsSectionContent;
  roomsDisplay: RoomDisplayItem[];
  facilities: FacilityItem[];
  isLoading: boolean;
}

const defaultContent: SiteContent = {
  banner: {
    imageUrl: 'https://019dadb9-b77e-7d54-b090-02f504b20f6e.mochausercontent.com/WhatsApp-Image-2026-04-20-at-9.36.30-PM(1).jpeg',
    title: 'Bienvenidos a Morrocoy',
    subtitle: 'Descubra el paraíso caribeño en Posada Perla Negra, donde la naturaleza y el confort se encuentran.',
    highlightText: 'Su refugio perfecto en el corazón del Parque Nacional Morrocoy.',
  },
  roomsSection: {
    sectionTitle: 'Encuentre su refugio perfecto',
    sectionSubtitle: 'Nuestras Habitaciones',
    sectionDescription: 'Habitaciones cómodas y acogedoras diseñadas para que disfrute de su estadía en el paraíso caribeño de Morrocoy.',
  },
  roomsDisplay: [
    { id: 1, title: 'Habitación Familiar', description: 'Habitación cómoda ideal para familias pequeñas. Ambiente acogedor con aire acondicionado, WiFi, TV y baño privado. 10 habitaciones disponibles.', image: 'https://019dadb9-b77e-7d54-b090-02f504b20f6e.mochausercontent.com/WhatsApp-Image-2026-04-20-at-9.36.30-PM.jpeg', images: [], capacity: 4 },
    { id: 2, title: 'Habitación Familiar Grande', description: 'Espaciosa habitación para familias numerosas. Mayor espacio y comodidad con múltiples camas. 8 habitaciones disponibles.', image: 'https://019dadb9-b77e-7d54-b090-02f504b20f6e.mochausercontent.com/WhatsApp-Image-2026-04-20-at-9.36.30-PM.jpeg', images: [], capacity: 6 },
    { id: 3, title: 'Habitación Extrafamiliar', description: 'Diseñada para grupos grandes o varias familias. Amplio espacio con múltiples ambientes y baños. 2 habitaciones disponibles.', image: 'https://019dadb9-b77e-7d54-b090-02f504b20f6e.mochausercontent.com/WhatsApp-Image-2026-04-20-at-9.36.30-PM.jpeg', images: [], capacity: 8 },
    { id: 4, title: 'Habitación Ejecutiva', description: 'Nuestra habitación premium con acabados de lujo y servicios exclusivos. Perfecta para viajeros exigentes. 1 habitación disponible.', image: 'https://019dadb9-b77e-7d54-b090-02f504b20f6e.mochausercontent.com/WhatsApp-Image-2026-04-20-at-9.36.30-PM.jpeg', images: [], capacity: 2 },
  ],
  facilities: [
    { id: 1, name: 'Fachada', description: 'Vista de nuestras acogedoras habitaciones con iluminación nocturna', image: 'https://019dadb9-b77e-7d54-b090-02f504b20f6e.mochausercontent.com/WhatsApp-Image-2026-04-20-at-9.36.30-PM(1).jpeg' },
    { id: 2, name: 'Entrada Principal', description: 'Bienvenidos a Posada Perla Negra', image: 'https://019dadb9-b77e-7d54-b090-02f504b20f6e.mochausercontent.com/WhatsApp-Image-2026-04-20-at-9.36.30-PM(2).jpeg' },
    { id: 3, name: 'Habitaciones', description: 'Cómodas habitaciones con aire acondicionado y decoración natural', image: 'https://019dadb9-b77e-7d54-b090-02f504b20f6e.mochausercontent.com/WhatsApp-Image-2026-04-20-at-9.36.30-PM.jpeg' },
    { id: 4, name: 'Estacionamiento', description: 'Estacionamiento privado y seguro para nuestros huéspedes', image: 'https://019dadb9-b77e-7d54-b090-02f504b20f6e.mochausercontent.com/WhatsApp-Image-2026-04-20-at-9.36.30-PM(2).jpeg' },
  ],
  isLoading: true,
};

export function useSiteContent(): SiteContent {
  const [content, setContent] = useState<SiteContent>(defaultContent);

  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetch('/api/site-content');
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data: SiteContentItem[] = await response.json();
        
        // Parse banner content
        const banner: BannerContent = {
          imageUrl: data.find(d => d.section === 'banner' && d.content_key === 'image_url')?.content_value || defaultContent.banner.imageUrl,
          title: data.find(d => d.section === 'banner' && d.content_key === 'title')?.content_value || defaultContent.banner.title,
          subtitle: data.find(d => d.section === 'banner' && d.content_key === 'subtitle')?.content_value || defaultContent.banner.subtitle,
          highlightText: data.find(d => d.section === 'banner' && d.content_key === 'highlight_text')?.content_value || defaultContent.banner.highlightText,
        };

        // Parse rooms section content
        const roomsSection: RoomsSectionContent = {
          sectionTitle: data.find(d => d.section === 'rooms_section' && d.content_key === 'title')?.content_value || defaultContent.roomsSection.sectionTitle,
          sectionSubtitle: data.find(d => d.section === 'rooms_section' && d.content_key === 'subtitle')?.content_value || defaultContent.roomsSection.sectionSubtitle,
          sectionDescription: data.find(d => d.section === 'rooms_section' && d.content_key === 'description')?.content_value || defaultContent.roomsSection.sectionDescription,
        };

        // Parse facilities
        const facilitiesData = data.filter(d => d.section === 'facilities');
        const facilityIds = [...new Set(facilitiesData.map(f => f.content_key.split('_')[0]))];
        
        const facilities: FacilityItem[] = facilityIds.map((id, index) => {
          const name = facilitiesData.find(f => f.content_key === `${id}_title`)?.content_value || defaultContent.facilities[index]?.name || '';
          const description = facilitiesData.find(f => f.content_key === `${id}_description`)?.content_value || defaultContent.facilities[index]?.description || '';
          const image = facilitiesData.find(f => f.content_key === `${id}_image`)?.content_value || defaultContent.facilities[index]?.image || '';
          return { id: index + 1, name, description, image };
        });

        // Parse rooms display (4 room types for Posada Perla Negra)
        const roomsDisplayData = data.filter(d => d.section === 'rooms_display');
        const roomsDisplay: RoomDisplayItem[] = [];
        for (let i = 1; i <= 4; i++) {
          const image = roomsDisplayData.find(r => r.content_key === `room_${i}_image`)?.content_value || defaultContent.roomsDisplay[i-1]?.image || '';
          const title = roomsDisplayData.find(r => r.content_key === `room_${i}_title`)?.content_value || defaultContent.roomsDisplay[i-1]?.title || '';
          const description = roomsDisplayData.find(r => r.content_key === `room_${i}_description`)?.content_value || defaultContent.roomsDisplay[i-1]?.description || '';
          const capacity = parseInt(roomsDisplayData.find(r => r.content_key === `room_${i}_capacity`)?.content_value || '') || defaultContent.roomsDisplay[i-1]?.capacity || 2;
          
          // Parse additional images (stored as JSON array)
          let images: string[] = [];
          const imagesRaw = roomsDisplayData.find(r => r.content_key === `room_${i}_images`)?.content_value;
          if (imagesRaw) {
            try {
              images = JSON.parse(imagesRaw);
            } catch {
              images = [];
            }
          }
          
          roomsDisplay.push({ id: i, title, description, image, images, capacity });
        }

        setContent({
          banner,
          roomsSection,
          roomsDisplay,
          facilities: facilities.length > 0 ? facilities : defaultContent.facilities,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error fetching site content:', error);
        setContent({ ...defaultContent, isLoading: false });
      }
    }

    fetchContent();
  }, []);

  return content;
}
