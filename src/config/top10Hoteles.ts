export interface Top10Hotel {
  id: number;
  name: string;
  location: string;
  state: string;
  category: string;
  description: string;
  seoAttributes: string[];
  defaultImage: string;
}

export const TOP10_HOTELS_STATIC_DATA: Top10Hotel[] = [
  {
    id: 1,
    name: "Hotel Humboldt San Bernardino",
    location: "Cima del Cerro El Ávila (Warairarepano)",
    state: "Caracas / Distrito Capital",
    category: "Lujo Histórico e Icónico",
    description: "El Hotel Humboldt es indiscutiblemente la joya arquitectónica más emblemática de la hotelería venezolana. Situado a más de 2,100 metros sobre el nivel del mar en la cima del Warairarepano, este coloso del modernismo ofrece una vista panorámica de 360 grados que funde visualmente el valle de Caracas con la inmensidad azul del Mar Caribe.\n\nTras una restauración monumental, sus instalaciones combinan el diseño vanguardista original de Tomás Sanabria con lujos contemporáneos de clase mundial. Cuenta con suites de alta gama, salones de alta cocina internacional, cúpula mirador giratoria y un sistema de funicular ultramoderno que conecta la ciudad con la cumbre en minutos.",
    seoAttributes: [
      "Hotel icónico Caracas",
      "Turismo de altura Venezuela",
      "Arquitectura moderna",
      "Vistas panorámicas Warairarepano"
    ],
    defaultImage: "https://images.unsplash.com/photo-1549294413-26f195afcbce?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 2,
    name: "Eurobuilding Hotel & Suites Caracas",
    location: "Urbanización Las Mercedes, Caracas",
    state: "Caracas / Las Mercedes",
    category: "5 Estrellas / Corporativo de Gran Escala",
    description: "Considerado por décadas como el epicentro indiscutible de la hotelería ejecutiva y de convenciones en el país, el Eurobuilding Hotel & Suites representa la máxima expresión de infraestructura hotelera corporativa en la capital.\n\nUbicado estratégicamente en el sector financiero y comercial de Las Mercedes, ofrece más de 600 habitaciones y suites de lujo, un centro de convenciones capaz de albergar eventos masivos de talla internacional, múltiples opciones gastronómicas de alta gama, piscina exterior climatizada, canchas de tenis y estrictos protocolos de seguridad y privacidad para dignatarios y ejecutivos globales.",
    seoAttributes: [
      "Hotel corporativo Caracas",
      "Centro de convenciones Las Mercedes",
      "Hotelería de lujo Venezuela"
    ],
    defaultImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 3,
    name: "JW Marriott Hotel Caracas",
    location: "Av. Venezuela, El Rosal, Caracas",
    state: "Caracas / El Rosal",
    category: "Lujo Internacional y Ejecutivo",
    description: "El JW Marriott Caracas eleva los estándares del servicio hotelero internacional a su máxima expresión en pleno corazón financiero de la capital. Diseñado bajo las exigencias de la marca global Marriott, es el preferido por directivos multinacionales, diplomáticos y viajeros de negocios que exigen eficiencia impecable.\n\nSus instalaciones destacan por una decoración sobria y elegante, habitaciones equipadas con tecnología de punta y camas de confort superior, salones ejecutivos con atención personalizada, gimnasio completamente equipado y una propuesta culinaria que fusiona la alta cocina internacional con matices locales.",
    seoAttributes: [
      "Hotel de negocios Caracas",
      "JW Marriott El Rosal",
      "Hospedaje ejecutivo Venezuela"
    ],
    defaultImage: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 4,
    name: "Lidotel Barquisimeto",
    location: "Centro Comercial Sambil Barquisimeto",
    state: "Barquisimeto / Estado Lara",
    category: "5 Estrellas / Confort Urbano",
    description: "Situado en el este de la capital larense y conectado al principal centro comercial de la región, Lidotel Barquisimeto se posiciona como el estandarte de la hospitalidad y el confort en el centro-occidente del país.\n\nDestaca por su impecable servicio al cliente, habitaciones deluxe con lencería de alta gama, diseño contemporáneo, seguridad integral y una ubicación privilegiada que facilita el acceso a los puntos comerciales, culturales y gastronómicos más importantes de la Ciudad Musical de Venezuela. Es el refugio predilecto tanto para familias exigentes como para el sector corporativo regional.",
    seoAttributes: [
      "Mejor hotel Barquisimeto",
      "Lidotel Lara",
      "Hospedaje C.C. Sambil Barquisimeto"
    ],
    defaultImage: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 5,
    name: "Hotel Hesperia WTC Valencia",
    location: "Zona Norte / Av. Salvador Feo La Cruz, Valencia",
    state: "Valencia / Estado Carabobo",
    category: "5 Estrellas / Gigante Industrial",
    description: "El Hotel Hesperia WTC Valencia es el complejo hotelero y de convenciones más imponente del centro industrial de Venezuela. Adosado al prestigioso World Trade Center Valencia, su torre domina el horizonte de la zona norte de la ciudad.\n\nEste complejo destaca por su piscina olímpica exterior, áreas comerciales exclusivas, un centro de convenciones de capacidad masiva para eventos corporativos y ferias internacionales, y habitaciones amplias con acabados de lujo que garantizan una experiencia de descanso inigualable tras jornadas intensas de negocios.",
    seoAttributes: [
      "Hotel Hesperia Valencia",
      "World Trade Center Carabobo",
      "Convenciones Venezuela"
    ],
    defaultImage: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 6,
    name: "Tibisay Hotel Boutique Margarita",
    location: "Playa El Agua / Costa Caribeña, Margarita",
    state: "Isla de Margarita / Estado Nueva Esparta",
    category: "Lujo Playero y Boutique",
    description: "Representando lo mejor del turismo insular en la Perla del Caribe, el Tibisay Hotel Boutique Margarita redefine el concepto de hospitalidad vacacional de alta gama frente al mar.\n\nCon un diseño arquitectónico vanguardista que se integra armónicamente con el paisaje marino, ofrece acceso directo a las paradisíacas playas margariteñas, piscinas estilo infinity, un spa de categoría mundial enfocado en bienestar integral y una propuesta gastronómica marina excepcional que resalta los sabores tropicales del Caribe venezolano.",
    seoAttributes: [
      "Hotel boutique Margarita",
      "Resort playa El Agua",
      "Turismo de lujo Venezuela"
    ],
    defaultImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 7,
    name: "Hotel Venetur Maracaibo",
    location: "El Milagro, Maracaibo, Estado Zulia",
    state: "Maracaibo / Estado Zulia",
    category: "5 Estrellas / Tradición Occidental",
    description: "Enclavado a la majestuosa orilla del Lago de Maracaibo, el Hotel Venetur Maracaibo es un símbolo indiscutible de la hotelería en el occidente venezolano, famoso por su calidez, espacios tropicales abiertos y su imponente arquitectura.\n\nEl hotel ofrece extensas áreas verdes, una de las piscinas más grandes de la región occidental, salones ideales para bodas y eventos multitudinarios, y habitaciones que capturan la brisa lacustre, brindando una experiencia inmersiva en la rica cultura y alegría del pueblo zuliano.",
    seoAttributes: [
      "Hotel Maracaibo lago",
      "Venetur Zulia",
      "Hotelería occidental Venezuela"
    ],
    defaultImage: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 8,
    name: "Wyndham Garden Porlamar",
    location: "Porlamar, Isla de Margarita",
    state: "Isla de Margarita / Estado Nueva Esparta",
    category: "4 Estrellas / Confort Insular Contemporáneo",
    description: "Bajo el prestigioso sello internacional de la cadena Wyndham, este hotel en Porlamar combina la eficiencia del servicio corporativo con la relajación absoluta que demanda una escapada vacacional en la Isla de Margarita.\n\nDispone de instalaciones modernas, habitaciones de diseño minimalista y funcional, áreas de esparcimiento familiar, piscinas, gimnasio y una ubicación estratégica que permite a los huéspedes acceder con facilidad a los centros comerciales libres de impuestos y a los principales atractivos turísticos insulares.",
    seoAttributes: [
      "Wyndham Margarita",
      "Hotel Porlamar",
      "Hospedaje vacacional Venezuela"
    ],
    defaultImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 9,
    name: "Parador Turístico & Hotel de Montaña (Mérida)",
    location: "Cordillera de los Andes, Estado Mérida",
    state: "Mérida / Estado Mérida",
    category: "Ecoturismo Andino y Cabañas de Lujo",
    description: "Para los amantes del ecoturismo de montaña y el turismo contemplativo, la oferta de alta gama en el estado Mérida destaca a través de posadas de montaña y paradores turísticos que emulan la arquitectura tradicional andina a base de piedra y madera noble.\n\nEstos refugios serranos ofrecen chimeneas centrales, vistas prestigiosas hacia los majestuosos picos nevados de la Sierra Nevada, gastronomía típica andina de altura (pizca andina, trucha fresca) y un ambiente de paz absoluta ideal para el descanso y la desconexión.",
    seoAttributes: [
      "Hoteles en Mérida Venezuela",
      "Turismo andino",
      "Cabañas de montaña Los Andes"
    ],
    defaultImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 10,
    name: "Posada Boutique & Ecotodge Costa de Aragua (Choroní / Ocumare)",
    location: "Parque Nacional Henri Pittier / Costa Aragüeña",
    state: "Costa de Aragua / Estado Aragua",
    category: "Ecoturismo Costero y Exclusividad",
    description: "Cierra este selecto listado el modelo de posadas boutique de alta gama ubicadas en la franja costera del estado Aragua, inmersas en la exuberante vegetación tropical del Parque Nacional Henri Pittier y a pasos de playas caribeñas vírgenes.\n\nEstas instalaciones combinan el concepto de casonas coloniales restauradas con comodidades modernas de lujo, piscinas internas rodeadas de palmeras, gastronomía basada en frutos del mar y cacao histórico de Chuao, ofreciendo una experiencia íntima e inolvidable.",
    seoAttributes: [
      "Posadas boutique Choroní",
      "Ecoturismo costa Aragua",
      "Hoteles playa Venezuela"
    ],
    defaultImage: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80"
  }
];
