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
    imageUrl: 'https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-6.jpg',
    title: 'Su casa en la Playa',
    subtitle: 'Despierte con el sonido de las olas y descubra el verdadero significado de descansar.',
    highlightText: '20 habitaciones con vista al mar esperan por usted.',
  },
  roomsSection: {
    sectionTitle: 'Encuentre su refugio perfecto',
    sectionSubtitle: 'Nuestras Habitaciones',
    sectionDescription: 'Desde acogedoras habitaciones matrimoniales hasta espaciosos apartamentos, cada espacio está diseñado para hacerle sentir como en casa.',
  },
  roomsDisplay: [
    { id: 1, title: 'Habitación Matrimonial', description: 'Perfecta para parejas, con cama matrimonial y vista relajante.', image: 'https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-3.jpg', images: [], capacity: 2 },
    { id: 2, title: 'Habitación Triple', description: 'Ideal para familias pequeñas o grupos de amigos.', image: 'https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-1.jpg', images: [], capacity: 3 },
    { id: 3, title: 'Habitación Cuádruple', description: 'Amplias habitaciones para familias que buscan comodidad.', image: 'https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-4.jpg', images: [], capacity: 4 },
    { id: 4, title: 'Apartamento', description: 'Tu hogar lejos de casa con cocina y sala.', image: 'https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-2.jpg', images: [], capacity: 5 },
    { id: 5, title: 'Habitación Vista Piscina', description: 'Disfruta de las mejores vistas a nuestra piscina.', image: 'https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-3.jpg', images: [], capacity: 2 },
    { id: 6, title: 'Suite Familiar', description: 'Espacio amplio diseñado para toda la familia.', image: 'https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-1.jpg', images: [], capacity: 4 },
    { id: 7, title: 'Habitación Estándar', description: 'Confort y practicidad para tu descanso.', image: 'https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-4.jpg', images: [], capacity: 3 },
    { id: 8, title: 'Apartamento Premium', description: 'Nuestro apartamento más completo con terraza privada.', image: 'https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-2.jpg', images: [], capacity: 6 },
  ],
  facilities: [
    { id: 1, name: 'Piscina de Noche', description: 'Disfruta de nuestra piscina con iluminación especial bajo las estrellas', image: 'https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-5.jpg' },
    { id: 2, name: 'Piscina', description: 'Refréscate en nuestra amplia piscina rodeada de palmeras', image: 'https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-6.jpg' },
    { id: 3, name: 'Estacionamiento', description: 'Estacionamiento privado y seguro para nuestros huéspedes', image: 'https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-8.jpg' },
    { id: 4, name: 'Áreas Comunes', description: 'Espacios acogedores para relajarte y disfrutar del ambiente caribeño', image: 'https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-7.jpg' },
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

        // Parse rooms display (8 rooms)
        const roomsDisplayData = data.filter(d => d.section === 'rooms_display');
        const roomsDisplay: RoomDisplayItem[] = [];
        for (let i = 1; i <= 8; i++) {
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
