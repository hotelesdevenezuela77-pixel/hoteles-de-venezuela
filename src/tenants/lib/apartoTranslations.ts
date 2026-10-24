export type Language = "es" | "en";

export interface TranslationDictionary {
  topbar: {
    lodgingTag: string;
    contactUs: string;
    immediateSupport: string;
  };
  nav: {
    home: string;
    rooms: string;
    gallery: string;
    services: string;
    about: string;
    location: string;
    directWa: string;
  };
  hero: {
    upcomingLaunch: string;
    title: string;
    subtitle: string;
    tagline: string;
    roomType: string;
    allTypes: string;
    couplesType: string;
    familyType: string;
    apartmentType: string;
    guests: string;
    anyCapacity: string;
    amenitiesFilter: string;
    allAmenities: string;
    searchBtn: string;
    pills: {
      piscina: string;
      planta: string;
      cayos: string;
      cocina: string;
      matrimoniales: string;
      wifi: string;
    };
  };
  trustBar: {
    googleTitle: string;
    googleSub: string;
    commTitle: string;
    commSub: string;
    powerTitle: string;
    powerSub: string;
  };
  presentation: {
    badge: string;
    title: string;
    description: string;
  };
  differentials: {
    diff1Title: string;
    diff1Desc: string;
    diff2Title: string;
    diff2Desc: string;
    diff3Title: string;
    diff3Desc: string;
    qualityStandard: string;
  };
  rooms: {
    badge: string;
    title: string;
    subtitle: string;
    tabs: {
      todas: string;
      parejas: string;
      familiares: string;
      apartamentos: string;
    };
    from: string;
    perNight: string;
    directRate: string;
    quoteWa: string;
    details: string;
    directBooking: string;
    noCommission: string;
    viewAll: string;
  };
  services: {
    badge: string;
    title: string;
    subtitle: string;
    included: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  reviews: {
    badge: string;
    title: string;
    ratingText: string;
    verifiedBadge: string;
    googleRole: string;
  };
  faq: {
    badge: string;
    title: string;
    subtitle: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  location: {
    badge: string;
    title: string;
    address: string;
    routeTitle: string;
    copyCoords: string;
    copied: string;
    openMaps: string;
    openWaze: string;
    mapView: string;
    satelliteView: string;
    verifiedAccess: string;
    ctaTitle: string;
    ctaSub: string;
    ctaBtn: string;
  };
  footer: {
    slogan: string;
    desc: string;
    contactHeader: string;
    companyName: string;
    rif: string;
    address: string;
    phone: string;
    email: string;
    quickLinksHeader: string;
    links: {
      inicio: string;
      posada: string;
      habitaciones: string;
      apartamentos: string;
      galeria: string;
      servicios: string;
      ubicacion: string;
      reservas: string;
      politicas: string;
    };
    socialHeader: string;
    weatherCity: string;
    weatherRegion: string;
    weatherTemp: string;
    weatherDesc: string;
    weatherLive: string;
    rights: string;
    operatedBy: string;
    payments: string[];
  };
}

export const APARTO_TRANSLATIONS: Record<Language, TranslationDictionary> = {
  es: {
    topbar: {
      lodgingTag: "Hospedaje de Selección",
      contactUs: "Contáctanos al",
      immediateSupport: "Atención Inmediata"
    },
    nav: {
      home: "Inicio",
      rooms: "Habitaciones & Tarifas",
      gallery: "Galería Instalaciones",
      services: "Servicios",
      about: "Sobre Nosotros",
      location: "Ubicación",
      directWa: "WhatsApp Directo"
    },
    hero: {
      upcomingLaunch: "PRÓXIMO LANZAMIENTO! • APLICACIÓN MULTI PLATAFORMA WEB EN ACTUALIZACIÓN",
      title: "APARTO POSADA DEL MAR",
      subtitle: "Su Casa en las Playas de Morrocoy • Tucacas",
      tagline: "Disfrute de confort familiar, piscina cristalina, planta eléctrica total y acceso directo a los cayos más paradisíacos de Venezuela.",
      roomType: "Tipo de Habitación",
      allTypes: "Todos los tipos",
      couplesType: "Parejas / Matrimonial VIP",
      familyType: "Habitaciones Familiares",
      apartmentType: "Apartamentos con Cocina",
      guests: "Huéspedes / Capacidad",
      anyCapacity: "Cualquier capacidad",
      amenitiesFilter: "Instalaciones & Servicios",
      allAmenities: "Todas las Instalaciones",
      searchBtn: "BUSCAR DISPONIBILIDAD",
      pills: {
        piscina: "Piscina iluminada",
        planta: "Planta Eléctrica 24/7",
        cayos: "Paseos Cayos Morrocoy",
        cocina: "Apartamentos con Cocina",
        matrimoniales: "Habitaciones Matrimoniales",
        wifi: "WiFi Starlink"
      }
    },
    trustBar: {
      googleTitle: "★ 4.8 en Google Reviews",
      googleSub: "+120 valoraciones de huéspedes",
      commTitle: "Contacto Directo 0% Comisiones",
      commSub: "Trato directo con los anfitriones",
      powerTitle: "Planta Eléctrica 100% & Agua Continua",
      powerSub: "Aires split y suministro 24/7 garantizado"
    },
    presentation: {
      badge: "EXPERIENCIA & HOSPITALIDAD EXCLUSIVA EN MORROCOY",
      title: "Su Casa en las Playas de Morrocoy",
      description: "Disfrute de la independencia de un apartamento totalmente equipado con la calidez, piscina cristalina y seguridad de una posada vacacional de primera línea."
    },
    differentials: {
      diff1Title: "Salida Directa & Cercanía a los Cayos",
      diff1Desc: "Ubicación estratégica a minutos de las mejores marinas privadas para embarcar directo hacia Cayo Sombrero, Cayo Muerto, Cayo Sal y Varadero sin demoras.",
      diff2Title: "Piscina Familiar Impecable & Solárium",
      diff2Desc: "Piscina cristalina tratada diariamente con área de baja profundidad para niños, solárium con reposeras ergonómicas e iluminación subacuática nocturna.",
      diff3Title: "Servicios Continuos 100% Garantizados",
      diff3Desc: "Planta eléctrica automática de capacidad total para energizar todos los aires acondicionados split y suministro continuo de agua potable.",
      qualityStandard: "Estándar de Calidad"
    },
    rooms: {
      badge: "ESTANCIA PERFECTA & TARIFAS DIRECTAS",
      title: "Habitaciones, Suites & Apartamentos",
      subtitle: "Selección exclusiva de nuestras unidades más solicitadas en Tucacas. Reserve directamente sin comisiones de intermediarios con confirmación inmediata por WhatsApp.",
      tabs: {
        todas: "Todas las Opciones",
        parejas: "Parejas / Suites VIP",
        familiares: "Familiares",
        apartamentos: "Apartamentos con Cocina"
      },
      from: "Desde",
      perNight: "/ noche",
      directRate: "Tarifa Directa",
      quoteWa: "Cotizar WhatsApp",
      details: "Detalles",
      directBooking: "Reserva Directa",
      noCommission: "0% Comisiones",
      viewAll: "Ver todas las opciones disponibles (Catálogo Completo)"
    },
    services: {
      badge: "COMODIDADES & BIENESTAR COMPLETO",
      title: "Servicios e Instalaciones",
      subtitle: "Diseñadas para maximizar el confort familiar y garantizar una estadía libre de preocupaciones en el Parque Nacional Morrocoy.",
      included: "Servicio Incluido en la Estadía",
      items: [
        {
          title: "Piscina & Solárium",
          description: "Piscina cristalina con solárium y reposeras. Iluminación nocturna para disfrutar también después del atardecer."
        },
        {
          title: "Parrilleras & Caney",
          description: "Área social equipada con parrilleras de carbón, mesas y sombras para compartir asados familiares al aire libre."
        },
        {
          title: "Cocina Equipada en Apartamentos",
          description: "Nuestras unidades tipo apartamento cuentan con cocina, nevera y utensilios para cocinar su propia comida fresca."
        },
        {
          title: "Lanchas Privadas para Traslados",
          description: "Asesoría y coordinación directa de traslados náuticos en peñero o yate privado hacia los cayos del Parque Morrocoy."
        },
        {
          title: "Estacionamiento Cerrado y Vigilado",
          description: "Aparcamiento interno privado dentro de las instalaciones con portón de seguridad para la total tranquilidad de su vehículo."
        },
        {
          title: "Planta Eléctrica & Agua Continua",
          description: "Respaldo energético 100% automático para todos los aires acondicionados y suministro continuo de agua sin fallas."
        }
      ]
    },
    reviews: {
      badge: "EXPERIENCIAS REALES & CONFIANZA TOTAL",
      title: "Opiniones de Nuestros Huéspedes",
      ratingText: "4.9 de 5 en Google Reviews (+120 evaluaciones verificadas)",
      verifiedBadge: "Google Maps Oficial",
      googleRole: "Huésped Verificado"
    },
    faq: {
      badge: "CLARIDAD & ATENCIÓN DIRECTA",
      title: "Preguntas Frecuentes",
      subtitle: "Todo lo que necesita conocer para planificar su estancia perfecta en Aparto Posada del Mar.",
      items: [
        {
          question: "¿Cuentan con planta eléctrica y suministro de agua continuo?",
          answer: "Sí, absolutamente. Contamos con una planta eléctrica industrial de respaldo 100% que alimenta todas las áreas, incluyendo los aires acondicionados de todas las habitaciones las 24 horas del día. Además, disponemos de sistema de reserva de agua de gran capacidad con suministro continuo, garantizando agua dulce limpia y sin racionamientos durante toda su estancia."
        },
        {
          question: "¿Tienen planes de traslados en lancha a los cayos de Morrocoy?",
          answer: "Sí. Brindamos asesoría y enlace directo con capitanes y marinas aliadas de confianza para organizar paseos en peñero o yates privados hacia Cayo Sombrero, Cayo Muerto, Cayo Sal, Playuela y los mejores rincones del Parque Nacional Morrocoy, con zarpe prioritario y tarifas justas sin intermediarios."
        },
        {
          question: "¿Cuáles son las políticas de check-in y check-out?",
          answer: "El horario regular de Check-in es a partir de las 3:00 PM y el Check-out se realiza a la 1:00 PM. Si necesita ingresar antes o salir más tarde (Early Check-in o Late Check-out), puede consultarlo directamente con recepción al momento de confirmar su reserva por WhatsApp, sujeto a disponibilidad."
        },
        {
          question: "¿Los apartamentos cuentan con cocina y utensilios?",
          answer: "Sí. Nuestras unidades tipo Apartamento están completamente equipadas con cocina a gas o eléctrica, nevera de gran capacidad, licuadora, cubiertos, ollas, vajilla completa y área de comedor privado para que su familia disfrute de total independencia culinaria."
        },
        {
          question: "¿Aceptan mascotas en las instalaciones?",
          answer: "Con el fin de garantizar el máximo descanso, tranquilidad, higiene y bienestar de todos nuestros huéspedes, en Aparto Posada del Mar no admitimos mascotas en las habitaciones ni en las áreas comunes. Agradecemos enormemente su comprensión para mantener nuestros altos estándares de confort y silencio."
        }
      ]
    },
    location: {
      badge: "ACCESO ESTRATÉGICO A PLAYAS Y CAYOS",
      title: "Ubicación & Cómo Llegar",
      address: "Av. Silva, Tucacas 2055, Falcón, Venezuela",
      routeTitle: "Instrucciones Claras de Llegada",
      copyCoords: "Copiar Coordenadas",
      copied: "¡Copiadas!",
      openMaps: "Google Maps",
      openWaze: "Abrir en Waze",
      mapView: "Mapa",
      satelliteView: "Satélite",
      verifiedAccess: "ACCESO VERIFICADO • TUCACAS / MORROCOY",
      ctaTitle: "¿Listo para Disfrutar de Morrocoy en Familia?",
      ctaSub: "Consulte disponibilidad inmediata y obtenga la mejor tarifa directa garantizada sin comisiones de agencias.",
      ctaBtn: "Consultar Disponibilidad por WhatsApp"
    },
    footer: {
      slogan: "¡Su Casa en las Playas de Morrocoy!",
      desc: "La libertad de un apartamento equipado con la piscina, seguridad y confort de una posada de primera clase.",
      contactHeader: "Contacto Oficial",
      companyName: "Inversiones Febo C.A.",
      rif: "RIF: J-30443898-2",
      address: "Av. Silva, Tucacas, Estado Falcón, Venezuela",
      phone: "(+58) 414 481 5321",
      email: "info@apartoposadadelmar.com",
      quickLinksHeader: "Acceso Rápido",
      links: {
        inicio: "INICIO",
        posada: "LA POSADA",
        habitaciones: "HABITACIONES",
        apartamentos: "APARTAMENTOS",
        galeria: "GALERÍA HD",
        servicios: "SERVICIOS",
        ubicacion: "UBICACIÓN",
        reservas: "RESERVAS",
        politicas: "POLÍTICAS DE ESTADÍA"
      },
      socialHeader: "Redes Sociales",
      weatherCity: "Tucacas",
      weatherRegion: "Parque Nacional Morrocoy",
      weatherTemp: "32° / 26°",
      weatherDesc: "Soleado • Brisa Marina Ideal",
      weatherLive: "Pronóstico en Vivo • Meteored",
      rights: "© 2016 - 2026 Todos los Derechos Reservados por Aparto Posada del Mar",
      operatedBy: "Sitio Web Oficial • Operado bajo tecnología Hoteles de Venezuela SaaS",
      payments: ["Zelle", "Pago Móvil", "Efectivo USD", "Transferencia"]
    }
  },
  en: {
    topbar: {
      lodgingTag: "Exclusive Lodging",
      contactUs: "Contact us at",
      immediateSupport: "Instant Assistance"
    },
    nav: {
      home: "Home",
      rooms: "Rooms & Rates",
      gallery: "Facilities Gallery",
      services: "Amenities",
      about: "About Us",
      location: "Location",
      directWa: "Direct WhatsApp"
    },
    hero: {
      upcomingLaunch: "UPCOMING LAUNCH! • MULTI-PLATFORM WEB APP IN UPDATE",
      title: "APARTO POSADA DEL MAR",
      subtitle: "Your Beachfront Haven in Morrocoy • Tucacas",
      tagline: "Experience family comfort, crystal-clear swimming pool, 100% backup power generator, and direct boat access to Venezuela's most breathtaking coral cays.",
      roomType: "Room Type",
      allTypes: "All Room Types",
      couplesType: "Couples / VIP King Suite",
      familyType: "Family Rooms",
      apartmentType: "Apartments with Kitchen",
      guests: "Guests / Capacity",
      anyCapacity: "Any Capacity",
      amenitiesFilter: "Amenities & Facilities",
      allAmenities: "All Facilities",
      searchBtn: "CHECK AVAILABILITY",
      pills: {
        piscina: "Illuminated Pool",
        planta: "24/7 Power Generator",
        cayos: "Morrocoy Cay Boat Tours",
        cocina: "Apartments with Kitchen",
        matrimoniales: "King Bedroom Suites",
        wifi: "Starlink WiFi"
      }
    },
    trustBar: {
      googleTitle: "★ 4.8 on Google Reviews",
      googleSub: "+120 verified guest reviews",
      commTitle: "Direct Booking 0% Commissions",
      commSub: "Direct communication with hosts",
      powerTitle: "100% Power Generator & Continuous Water",
      powerSub: "Split A/C & uninterrupted 24/7 supply"
    },
    presentation: {
      badge: "EXCLUSIVE HOSPITALITY & EXPERIENCE IN MORROCOY",
      title: "Your Home on the Beaches of Morrocoy",
      description: "Enjoy the independence of a fully equipped apartment combined with the warmth, crystal-clear swimming pool, and security of a premier boutique vacation inn."
    },
    differentials: {
      diff1Title: "Direct Boat Access to the Coral Cays",
      diff1Desc: "Strategic location minutes from the best private marinas for hassle-free departures to Cayo Sombrero, Cayo Muerto, Cayo Sal, and Varadero.",
      diff2Title: "Impeccable Family Pool & Sun Deck",
      diff2Desc: "Crystal-clear pool maintained daily with shallow area for children, sun terrace with ergonomic loungers, and underwater LED night lighting.",
      diff3Title: "100% Guaranteed Continuous Utilities",
      diff3Desc: "Automatic full-capacity industrial generator powering all split air conditioners, paired with an uninterrupted fresh water reserve system.",
      qualityStandard: "Certified Standard"
    },
    rooms: {
      badge: "PERFECT STAY & DIRECT RATES",
      title: "Rooms, Suites & Apartments",
      subtitle: "Exclusive selection of our most requested units in Tucacas. Book directly with zero intermediary fees and instant WhatsApp confirmation.",
      tabs: {
        todas: "All Options",
        parejas: "Couples / VIP Suites",
        familiares: "Family Units",
        apartamentos: "Apartments with Kitchen"
      },
      from: "From",
      perNight: "/ night",
      directRate: "Direct Rate",
      quoteWa: "Inquire via WhatsApp",
      details: "Details",
      directBooking: "Direct Booking",
      noCommission: "0% Commissions",
      viewAll: "View all available units (Complete Catalog)"
    },
    services: {
      badge: "COMPLETE COMFORT & WELL-BEING",
      title: "Amenities & Facilities",
      subtitle: "Tailored to maximize family comfort and guarantee a peaceful, worry-free vacation in Morrocoy National Park.",
      included: "Included with Your Stay",
      items: [
        {
          title: "Swimming Pool & Solarium",
          description: "Crystal-clear pool with sun terrace and loungers. Evening lighting to enjoy serene moments after sunset."
        },
        {
          title: "Barbecue Grill & Gazebo",
          description: "Shaded social area equipped with charcoal grills and tables to share memorable outdoor family cookouts."
        },
        {
          title: "Fully Equipped Kitchens",
          description: "Our apartment units feature full kitchens, large refrigerators, and utensils to cook fresh home-style meals."
        },
        {
          title: "Private Boat Transfers",
          description: "Direct assistance and liaison with trusted boat captains for private excursions to Morrocoy's crystal-clear cays."
        },
        {
          title: "Gated & Monitored Parking",
          description: "Private internal parking located securely inside the premises with security gate for your peace of mind."
        },
        {
          title: "Power Generator & Constant Water",
          description: "100% automatic electrical backup for all air conditioning units and a high-capacity continuous water reserve."
        }
      ]
    },
    reviews: {
      badge: "AUTHENTIC EXPERIENCES & TOTAL TRUST",
      title: "Guest Reviews & Experiences",
      ratingText: "4.9 out of 5 on Google Reviews (+120 verified reviews)",
      verifiedBadge: "Official Google Maps",
      googleRole: "Verified Guest"
    },
    faq: {
      badge: "CLARITY & DIRECT ASSISTANCE",
      title: "Frequently Asked Questions",
      subtitle: "Everything you need to know to plan your dream vacation at Aparto Posada del Mar.",
      items: [
        {
          question: "Do you have a backup power generator and continuous water?",
          answer: "Yes, absolutely. We have an industrial backup generator that powers 100% of our facilities, including all split air conditioning units 24 hours a day. In addition, our high-capacity water reserve ensures clean, continuous running water with zero shortages throughout your entire stay."
        },
        {
          question: "Do you organize boat trips to the Morrocoy cays?",
          answer: "Yes. We provide direct coordination with trusted, certified captains and marinas for private boat transfers to Cayo Sombrero, Cayo Muerto, Cayo Sal, Playuela, and the park's most scenic spots, with priority departure and transparent pricing."
        },
        {
          question: "What are your check-in and check-out times?",
          answer: "Standard check-in begins at 3:00 PM and check-out is at 1:00 PM. If you require early check-in or late check-out, simply consult with our reception team when booking via WhatsApp, subject to availability."
        },
        {
          question: "Do the apartments come with kitchen appliances and cookware?",
          answer: "Yes. Our apartment units come fully equipped with stoves, full-size refrigerators, blenders, cutlery, pots, pans, tableware, and a dining area so your family can enjoy complete culinary independence."
        },
        {
          question: "Are pets allowed on the premises?",
          answer: "To ensure optimal rest, comfort, cleanliness, and tranquility for all guests, Aparto Posada del Mar does not admit pets inside guest rooms or common areas. We greatly appreciate your understanding in helping us maintain our high standards of hospitality."
        }
      ]
    },
    location: {
      badge: "STRATEGIC ACCESS TO BEACHES & CAYS",
      title: "Location & Directions",
      address: "Av. Silva, Tucacas 2055, Falcón, Venezuela",
      routeTitle: "Clear Driving Directions",
      copyCoords: "Copy Coordinates",
      copied: "Copied!",
      openMaps: "Google Maps",
      openWaze: "Open in Waze",
      mapView: "Map",
      satelliteView: "Satellite",
      verifiedAccess: "VERIFIED ACCESS • TUCACAS / MORROCOY",
      ctaTitle: "Ready to Experience Morrocoy with Your Family?",
      ctaSub: "Inquire about instant dates and secure the guaranteed best direct rate with zero agency markups.",
      ctaBtn: "Check Availability via WhatsApp"
    },
    footer: {
      slogan: "Your Beachfront Haven in Morrocoy!",
      desc: "The freedom of an equipped apartment combined with the pool, security, and comfort of a premier inn.",
      contactHeader: "Official Contact",
      companyName: "Inversiones Febo C.A.",
      rif: "Tax ID: J-30443898-2",
      address: "Av. Silva, Tucacas, Falcón State, Venezuela",
      phone: "(+58) 414 481 5321",
      email: "info@apartoposadadelmar.com",
      quickLinksHeader: "Quick Access",
      links: {
        inicio: "HOME",
        posada: "THE INN",
        habitaciones: "ROOMS",
        apartamentos: "APARTMENTS",
        galeria: "HD GALLERY",
        servicios: "SERVICES",
        ubicacion: "LOCATION",
        reservas: "BOOKINGS",
        politicas: "STAY POLICIES"
      },
      socialHeader: "Social Media",
      weatherCity: "Tucacas",
      weatherRegion: "Morrocoy National Park",
      weatherTemp: "32° / 26°",
      weatherDesc: "Sunny • Ideal Caribbean Breeze",
      weatherLive: "Live Forecast • Meteored",
      rights: "© 2016 - 2026 All Rights Reserved by Aparto Posada del Mar",
      operatedBy: "Official Website • Powered by Hoteles de Venezuela SaaS",
      payments: ["Zelle", "Mobile Payment", "Cash USD", "Wire Transfer"]
    }
  }
};
