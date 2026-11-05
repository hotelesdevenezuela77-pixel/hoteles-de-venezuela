/**
 * DOCUMENTO 77 V15 + MAESTRO DE ETIQUETAS V15 + TAG GROUPS V15 + PASOS WIZARD V15
 * Arquitectura Oficial Depurada para Hoteles de Venezuela
 * - Filtro estricto anti-anacronismos: Exoneración total de "CADIVI" y cláusulas "COVID-19".
 * - Adaptación financiera nativa para Venezuela (USD / VES, Pago Móvil, Zelle, Binance Pay, Panamá, Custodia).
 */

export type CountryCodeV15 = "VE" | "ES";
export type TagDataTypeV15 = "string" | "integer" | "boolean" | "range";

export interface CountryCategoryV15 {
  id: number;
  name: string;
  code: string;
  iso: CountryCodeV15;
  defaultCurrency: "USD" | "EUR";
  secondaryCurrency?: "VES";
}

export const COUNTRY_CATEGORIES_V15: CountryCategoryV15[] = [
  {
    id: 1,
    name: "Venezuela",
    code: "CP-1",
    iso: "VE",
    defaultCurrency: "USD",
    secondaryCurrency: "VES",
  },
  {
    id: 2,
    name: "España",
    code: "CP-2",
    iso: "ES",
    defaultCurrency: "EUR",
  },
];

export interface ServiceCategoryV15 {
  id: number;
  code: string;
  backName: string;
  frontTitle: string;
  badgeText: string;
  description: string;
  includesList: string[];
  iconType: "hotel" | "resort" | "house" | "boat" | "gastronomy" | "nightlife" | "attraction" | "transport" | "tourism";
  isAccommodation: boolean;
}

/**
 *Las 4 Categorías Principales de Alojamiento (con el diseño exacto de las tarjetas V15)
 * más las categorías complementarias CS-05 a CS-09
 */
export const SERVICE_CATEGORIES_V15: ServiceCategoryV15[] = [
  {
    id: 1,
    code: "CS-01",
    backName: "Alojamiento tipo Hotel",
    frontTitle: "Hoteles y Hospedajes con recepción",
    badgeText: "DISPONIBLE",
    description:
      "Alojamientos tradicionales y unidades operativas con servicios hoteleros y recepción.",
    includesList: [
      "Hoteles",
      "Hostales, Posadas, Pensiones y Bed & Breakfast",
      "Albergues turísticos",
      "Residencias de estudiantes",
      "Hoteles cápsula",
      "Love hotels y Moteles",
    ],
    iconType: "hotel",
    isAccommodation: true,
  },
  {
    id: 2,
    code: "CS-02",
    backName: "Alojamiento tipo Agrupación de unidades habitacionales",
    frontTitle: "Resorts, Campings y complejos",
    badgeText: "DISPONIBLE",
    description:
      "Complejos y agrupaciones de recintos vacacionales con múltiples tipos de unidades habitacionales.",
    includesList: [
      "Apartahoteles",
      "Campings, Glampings & Eco-Lodges",
      "Resorts & Complejos Vacacionales",
      "Marinas",
    ],
    iconType: "resort",
    isAccommodation: true,
  },
  {
    id: 3,
    code: "CS-03",
    backName: "Alojamiento tipo Casa",
    frontTitle: "Inmuebles y viviendas vacacionales",
    badgeText: "DISPONIBLE",
    description:
      "Alojamientos independientes, residenciales o de uso privado para estancias completas o por habitaciones.",
    includesList: [
      "Casas, Chalets, Villas, Fincas, Haciendas",
      "Casas y Chalets de montaña / esquí",
      "Apartamentos turísticos",
      "Habitaciones en casas particulares",
    ],
    iconType: "house",
    isAccommodation: true,
  },
  {
    id: 4,
    code: "CS-04",
    backName: "Alojamiento en Embarcaciones y Servicios Náuticos",
    frontTitle: "Alojamiento en Embarcaciones y Servicios Náuticos",
    badgeText: "DISPONIBLE",
    description:
      "Experiencias de hospedaje sobre el agua, estáticas en puerto o con navegación incluida.",
    includesList: [
      "Barco con alojamiento estático en puerto",
      "Barco con alojamiento y navegación diaria incluida",
    ],
    iconType: "boat",
    isAccommodation: true,
  },
  {
    id: 5,
    code: "CS-05",
    backName: "Gastronomía",
    frontTitle: "Restaurantes, Cafeterías y Gastronomía",
    badgeText: "DISPONIBLE",
    description: "Restaurantes, cafeterías, bares de tapas, tabernas y experiencias culinarias.",
    includesList: ["Restaurantes", "Cafeterías y Bares de tapas", "Tabernas & Tascas"],
    iconType: "gastronomy",
    isAccommodation: false,
  },
  {
    id: 6,
    code: "CS-06",
    backName: "Vida nocturna",
    frontTitle: "Discotecas y Vida Nocturna",
    badgeText: "DISPONIBLE",
    description: "Locales nocturnos, lounges, rooftops y clubes de entretenimiento.",
    includesList: ["Discotecas y bares nocturnos"],
    iconType: "nightlife",
    isAccommodation: false,
  },
  {
    id: 7,
    code: "CS-07",
    backName: "Atracciones turísticas",
    frontTitle: "Parques y Atracciones Turísticas",
    badgeText: "DISPONIBLE",
    description: "Parques temáticos, acuáticos, recreativos y parques nacionales.",
    includesList: ["Parques de atracciones", "Parques nacionales"],
    iconType: "attraction",
    isAccommodation: false,
  },
  {
    id: 8,
    code: "CS-08",
    backName: "Alquiler de medios de transporte",
    frontTitle: "Rent-a-Car y Transporte Turístico",
    badgeText: "DISPONIBLE",
    description: "Alquiler de vehículos, motocicletas, motos de agua y quads.",
    includesList: [
      "Alquiler de coches",
      "Alquiler de motocicletas",
      "Alquiler de motos de agua",
      "Alquiler de quads",
    ],
    iconType: "transport",
    isAccommodation: false,
  },
  {
    id: 9,
    code: "CS-09",
    backName: "Servicios turísticos",
    frontTitle: "Agencias de Viaje y Creadores Oficiales",
    badgeText: "DISPONIBLE",
    description: "Agencias de viajes, operadores turísticos e influencers verificados.",
    includesList: ["Agencias de viaje", "Influencers"],
    iconType: "tourism",
    isAccommodation: false,
  },
];

export interface ServiceSubcategoryV15 {
  id: number;
  serviceCategoryId: number;
  code: string;
  name: string;
  isParent: boolean;
}

export const SERVICE_SUBCATEGORIES_V15: ServiceSubcategoryV15[] = [
  { id: 1, serviceCategoryId: 1, code: "SCS-01", name: "Hoteles", isParent: true },
  { id: 2, serviceCategoryId: 1, code: "SCS-02", name: "Hostales, Posadas, Pensiones y Bed & Breakfast", isParent: true },
  { id: 3, serviceCategoryId: 1, code: "SCS-03", name: "Albergues turísticos", isParent: true },
  { id: 4, serviceCategoryId: 1, code: "SCS-04", name: "Residencias de estudiantes", isParent: true },
  { id: 5, serviceCategoryId: 1, code: "SCS-05", name: "Hoteles cápsula", isParent: true },
  { id: 6, serviceCategoryId: 1, code: "SCS-06", name: "Love hotels y Moteles", isParent: true },
  { id: 7, serviceCategoryId: 2, code: "SCS-07", name: "Apartahoteles", isParent: true },
  { id: 8, serviceCategoryId: 2, code: "SCS-08", name: "Campings, Glampings & Eco-Lodges", isParent: true },
  { id: 9, serviceCategoryId: 2, code: "SCS-09", name: "Resorts & Complejos Vacacionales", isParent: true },
  { id: 10, serviceCategoryId: 2, code: "SCS-10", name: "Marinas", isParent: true },
  { id: 11, serviceCategoryId: 3, code: "SCS-11", name: "Casas, Chalets, Villas, Hatos, Fincas, Haciendas", isParent: true },
  { id: 12, serviceCategoryId: 3, code: "SCS-12", name: "Casas y Chalets de montaña / esquí", isParent: true },
  { id: 13, serviceCategoryId: 3, code: "SCS-13", name: "Apartamentos turísticos", isParent: true },
  { id: 14, serviceCategoryId: 3, code: "SCS-14", name: "Habitaciones en casas particulares", isParent: true },
  { id: 15, serviceCategoryId: 4, code: "SCS-15", name: "Barco con alojamiento estático en puerto", isParent: true },
  { id: 16, serviceCategoryId: 4, code: "SCS-16", name: "Barco con alojamiento y navegación diaria incluida", isParent: true },
  // Subcategorías hijas (Tabla Pivote 1 para CS-02)
  { id: 17, serviceCategoryId: 2, code: "SCS-17", name: "Mobil-home", isParent: false },
  { id: 18, serviceCategoryId: 2, code: "SCS-18", name: "Bungalow", isParent: false },
  { id: 19, serviceCategoryId: 2, code: "SCS-19", name: "Tienda de lona", isParent: false },
  { id: 20, serviceCategoryId: 2, code: "SCS-20", name: "Tienda safari", isParent: false },
  { id: 21, serviceCategoryId: 2, code: "SCS-21", name: "Tienda tipi", isParent: false },
  { id: 22, serviceCategoryId: 2, code: "SCS-22", name: "Casa en los árboles", isParent: false },
  { id: 23, serviceCategoryId: 2, code: "SCS-23", name: "Yurta", isParent: false },
  { id: 24, serviceCategoryId: 2, code: "SCS-24", name: "Casa, Chalet, Cabaña en complejo", isParent: false },
  { id: 25, serviceCategoryId: 2, code: "SCS-25", name: "Apartamento en complejo", isParent: false },
  { id: 26, serviceCategoryId: 2, code: "SCS-26", name: "Habitación tipo Loft / Estudio en complejo", isParent: false },
  { id: 27, serviceCategoryId: 2, code: "SCS-27", name: "Habitación tipo Suite en complejo", isParent: false },
  { id: 28, serviceCategoryId: 2, code: "SCS-28", name: "Parcela para tienda", isParent: false },
  { id: 29, serviceCategoryId: 2, code: "SCS-29", name: "Parcela para caravana", isParent: false },
  { id: 30, serviceCategoryId: 2, code: "SCS-30", name: "Parcela para autocaravana", isParent: false },
  // Categorías complementarias (31-42)
  { id: 31, serviceCategoryId: 5, code: "SCS-31", name: "Restaurantes", isParent: true },
  { id: 32, serviceCategoryId: 5, code: "SCS-32", name: "Cafeterías y Bares de tapas", isParent: true },
  { id: 33, serviceCategoryId: 5, code: "SCS-33", name: "Tabernas & Tascas", isParent: true },
  { id: 34, serviceCategoryId: 6, code: "SCS-34", name: "Discotecas y bares nocturnos", isParent: true },
  { id: 35, serviceCategoryId: 7, code: "SCS-35", name: "Parques de atracciones", isParent: true },
  { id: 36, serviceCategoryId: 7, code: "SCS-36", name: "Parques nacionales", isParent: true },
  { id: 37, serviceCategoryId: 9, code: "SCS-37", name: "Agencias de viaje", isParent: true },
  { id: 38, serviceCategoryId: 9, code: "SCS-38", name: "Influencers", isParent: true },
  { id: 39, serviceCategoryId: 8, code: "SCS-39", name: "Alquiler de coches", isParent: true },
  { id: 40, serviceCategoryId: 8, code: "SCS-40", name: "Alquiler de motocicletas", isParent: true },
  { id: 41, serviceCategoryId: 8, code: "SCS-41", name: "Alquiler de motos de agua", isParent: true },
  { id: 42, serviceCategoryId: 8, code: "SCS-42", name: "Alquiler de quads", isParent: true },
];

export const SUBCATEGORY_PARENTS_PIVOT_V15: Array<{
  parentId: number;
  childSubcategoryId: number;
  description: string;
}> = [
  { parentId: 7, childSubcategoryId: 25, description: "Apartamento dentro de Apartahotel" },
  { parentId: 7, childSubcategoryId: 26, description: "Habitación tipo Loft dentro de Apartahotel" },
  { parentId: 7, childSubcategoryId: 27, description: "Habitación tipo Suite dentro de Apartahotel" },
  ...[8, 9, 10].flatMap((parentId) =>
    [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((childId) => {
      const child = SERVICE_SUBCATEGORIES_V15.find((s) => s.id === childId);
      const parent = SERVICE_SUBCATEGORIES_V15.find((s) => s.id === parentId);
      return {
        parentId,
        childSubcategoryId: childId,
        description: `${child?.name || ""} dentro de ${parent?.name || ""}`,
      };
    })
  ),
];

export const TIPOS_DE_VIA_V15 = [
  "Avenida",
  "Calle",
  "Carrera",
  "Autopista",
  "Boulevard",
  "Callejón",
  "Camino",
  "Carretera Nacional",
  "Paseo",
  "Plaza",
  "Prolongación",
  "Redoma",
  "Transversal",
  "Urbanización",
  "Vereda",
  "Vía Principal",
];

export const ESTADOS_VENEZUELA_V15 = [
  "Amazonas",
  "Anzoátegui",
  "Apure",
  "Aragua",
  "Barinas",
  "Bolívar",
  "Carabobo",
  "Cojedes",
  "Delta Amacuro",
  "Dependencias Federales (Los Roques)",
  "Distrito Capital (Caracas)",
  "Falcón",
  "Guárico",
  "La Guaira",
  "Lara",
  "Mérida",
  "Miranda",
  "Monagas",
  "Nueva Esparta (Margarita y Coche)",
  "Portuguesa",
  "Sucre",
  "Táchira",
  "Trujillo",
  "Yaracuy",
  "Zulia",
];

export interface TagGroupV15 {
  id: number;
  code: string;
  name: string;
  parentCode?: string;
}

export const TAG_GROUPS_V15: TagGroupV15[] = [
  { id: 2, code: "C00.1", name: "Información General del Establecimiento/Servicio" },
  { id: 3, code: "C00.1.18", name: "Dirección Postal de la Propiedad", parentCode: "C00.1" },
  { id: 5, code: "C00.1.20", name: "Dirección de la Embarcación / Puerto Deportivo", parentCode: "C00.1" },
  { id: 7, code: "C00.1.24", name: "Entorno Geográfico", parentCode: "C00.1" },
  { id: 8, code: "C00.1.25", name: "Regiones y Destinos Clave en Venezuela", parentCode: "C00.1" },
  { id: 9, code: "C00.1.26", name: "Regiones y Destinos Clave en España", parentCode: "C00.1" },
  { id: 10, code: "C00.2", name: "Datos Fiscales del Establecimiento/Servicio" },
  { id: 13, code: "C00.3", name: "Contacto Operativo del Establecimiento/Servicio" },
  { id: 14, code: "C00.3.1", name: "Contacto Directo con HDV", parentCode: "C00.3" },
  { id: 15, code: "C00.3.2", name: "Contacto Directo con Clientes (Reservas y Recepción)", parentCode: "C00.3" },
  { id: 16, code: "C00.4", name: "Calificaciones Oficiales y Distinciones Gastronómicas" },
  { id: 17, code: "C00.5", name: "Certificaciones Ambientales, Sostenibilidad y Sello HDV" },
  { id: 18, code: "C00.6", name: "Distancia desde el Establecimiento a Lugares de Interés" },
  { id: 19, code: "C00.6.1", name: "Tipología de Lugar de Interés", parentCode: "C00.6" },
  { id: 20, code: "C01", name: "Equipamiento e Infraestructura de la Propiedad" },
  { id: 21, code: "C01.1", name: "Bienestar, Salud y Relax", parentCode: "C01" },
  { id: 22, code: "C01.2", name: "Ocio y Espacios Sociales", parentCode: "C01" },
  { id: 23, code: "C01.3", name: "Infraestructuras de Negocios y Eventos", parentCode: "C01" },
  { id: 24, code: "C01.4", name: "Abastecimiento y Energía Continua (Diferenciador Venezuela)", parentCode: "C01" },
  { id: 25, code: "C02", name: "Servicios de la Propiedad y Experiencias" },
  { id: 26, code: "C02.1", name: "Atención al Cliente y Recepción", parentCode: "C02" },
  { id: 27, code: "C02.2", name: "Atención Multilingüe", parentCode: "C02" },
  { id: 28, code: "C02.3", name: "Hostelería Interna y Gastronomía", parentCode: "C02" },
  { id: 29, code: "C02.4", name: "Mantenimiento de Habitaciones y Lavandería", parentCode: "C02" },
  { id: 30, code: "C02.5", name: "Conexión a Internet y Wi-Fi", parentCode: "C02" },
  { id: 31, code: "C02.6", name: "Movilidad, Parking y Transporte", parentCode: "C02" },
  { id: 32, code: "C02.7", name: "Actividades y Entretenimiento Organizado", parentCode: "C02" },
  { id: 33, code: "C03", name: "Accesibilidad y Seguridad de la Propiedad" },
  { id: 34, code: "C03.1", name: "Accesibilidad e Inclusión (PMR)", parentCode: "C03" },
  { id: 35, code: "C03.2", name: "Seguridad y Protección 24/7", parentCode: "C03" },
  { id: 36, code: "C04", name: "Políticas y Normas de la Propiedad" },
  { id: 37, code: "C04.1", name: "Horarios Check-In, Check-Out y Documentación Legal", parentCode: "C04" },
  { id: 38, code: "C04.2", name: "Política de Mascotas", parentCode: "C04" },
  { id: 39, code: "C04.3", name: "Perfil de Huésped", parentCode: "C04" },
  { id: 40, code: "C04.4", name: "Tabaco, Fiestas y Descanso", parentCode: "C04" },
  { id: 41, code: "C04.5", name: "Políticas Especiales por Tipología", parentCode: "C04" },
  { id: 42, code: "C04.6", name: "Régimen de Estancia y Desayunos", parentCode: "C04" },
  { id: 44, code: "C04.7.1", name: "Pago Electrónico Local en Venezuela (Bolívares - VES)", parentCode: "C04" },
  { id: 45, code: "C04.7.2", name: "Efectivo / Cash Admitido en Venezuela", parentCode: "C04" },
  { id: 46, code: "C04.7.3", name: "Transferencias en Divisas y Billeteras Internacionales (VE)", parentCode: "C04" },
  { id: 47, code: "C04.8", name: "Métodos y Plataformas de Pago Aceptadas en España", parentCode: "C04" },
  { id: 48, code: "C04.9", name: "Condiciones de la Reserva y Cancelación", parentCode: "C04" },
  { id: 49, code: "C04.10", name: "Condiciones para Estancia de Niños", parentCode: "C04" },
  { id: 50, code: "C05", name: "Distribución de las Unidades de Alojamiento (Habitación/Casa)" },
  { id: 51, code: "C06", name: "Equipamiento e Infraestructura de la Unidad de Alojamiento" },
  { id: 53, code: "C06.1.1", name: "Descanso y Confort de la Unidad", parentCode: "C06" },
  { id: 54, code: "C06.1.2", name: "Climatización y Tomas Eléctricas", parentCode: "C06" },
  { id: 55, code: "C06.1.3", name: "Tecnología, TV y Entretenimiento", parentCode: "C06" },
  { id: 56, code: "C06.1.4", name: "Zona de Trabajo y Estar", parentCode: "C06" },
  { id: 57, code: "C06.2", name: "Exteriores Privados de la Unidad", parentCode: "C06" },
  { id: 59, code: "C06.3.1", name: "Amenidades de Baño", parentCode: "C06" },
  { id: 60, code: "C06.3.2", name: "Baño Adaptado PMR en la Unidad", parentCode: "C06" },
  { id: 61, code: "C06.3.3", name: "Amenidades y Equipamiento de Cocina", parentCode: "C06" },
  { id: 62, code: "C07", name: "Instalaciones Específicas para Agrupación de Unidades (Resorts/Campings)" },
  { id: 63, code: "C08", name: "Instalaciones y Servicios Específicos para Love Hotels y Moteles" },
  { id: 68, code: "C09", name: "Instalaciones y Servicios Específicos para Casas de Montaña" },
  { id: 77, code: "C10", name: "Instalaciones y Servicios Específicos para Barcos con Alojamiento Estático en Puerto" },
  { id: 78, code: "C11", name: "Instalaciones y Servicios Específicos para Embarcaciones y Yates" },
];

/**
 * Esquema nativo JSONB para `rooms_distribution` en la tabla principal `establishments`.
 * Evita tablas relacionales hijas innecesarias para la distribución de unidades (C05 y C06).
 */
export interface RoomDistributionUnitJsonbV15 {
  id: string;
  unitName: string; // C05.1 Nombre comercial de la Habitación / Unidad / Camarote
  unitType: string; // Habitación, Suite, Bungalow, Glamping, Villa, Camarote, Alquiler Íntegro
  quantity: number; // Cantidad disponible de esta unidad
  maxOccupancy: number; // C05.5 Ocupación máxima
  sizeSqm: number; // C05.6 Tamaño en m²
  bedroomsCount: number; // C05.8 Dormitorios / C05.9 Camarotes
  privateBathroom: boolean; // C05.11 Baño privado
  privateKitchen: "none" | "kitchenette" | "full_kitchen"; // C05.17 / C05.18
  kingBeds: number; // C05.23 Camas King Size
  queenBeds: number; // C05.24 Camas Queen Size
  singleBeds: number; // C05.22 Camas Individuales
  sofaBeds: number; // Sofá cama
  pricePerNightUsd: number; // Tarifa base por noche ($ USD)
  unitAmenitiesCodes: string[]; // Códigos de equipamiento C06 activos en esta unidad
}

export const DEFAULT_ROOMS_DISTRIBUTION_JSONB_V15: RoomDistributionUnitJsonbV15[] = [
  {
    id: "unit-v15-1",
    unitName: "Suite Ejecutiva Deluxe King",
    unitType: "Suite",
    quantity: 4,
    maxOccupancy: 2,
    sizeSqm: 48,
    bedroomsCount: 1,
    privateBathroom: true,
    privateKitchen: "none",
    kingBeds: 1,
    queenBeds: 0,
    singleBeds: 0,
    sofaBeds: 0,
    pricePerNightUsd: 140,
    unitAmenitiesCodes: [
      "C06.1.1.1",
      "C06.1.1.8",
      "C06.1.2.1",
      "C06.1.3.1",
      "C06.1.4.1",
      "C06.1.4.5",
      "C06.3.1.8",
      "C06.3.1.11",
      "C06.3.3.2",
      "C06.3.3.9",
    ],
  },
  {
    id: "unit-v15-2",
    unitName: "Habitación Doble Superior Twin / Familiar",
    unitType: "Habitación",
    quantity: 8,
    maxOccupancy: 4,
    sizeSqm: 38,
    bedroomsCount: 1,
    privateBathroom: true,
    privateKitchen: "none",
    kingBeds: 0,
    queenBeds: 2,
    singleBeds: 0,
    sofaBeds: 0,
    pricePerNightUsd: 110,
    unitAmenitiesCodes: [
      "C06.1.1.1",
      "C06.1.2.1",
      "C06.1.3.1",
      "C06.3.1.8",
      "C06.3.1.11",
      "C06.3.3.9",
    ],
  },
];

export interface MasterTagV15 {
  tagId: number;
  tagGroupId: number;
  code: string;
  name: string;
  dataType: TagDataTypeV15;
  countries: "ALL" | "VE" | "ES";
  allowedSubcategories: string; // e.g., "ALL", "1-16", "1-4, 6", "15, 16"
  isSearchFilter: boolean;
  searchWeight: number;
  isRequired?: boolean;
  placeholder?: string;
}

export const MASTER_TAGS_V15: MasterTagV15[] = [
  // C00.1 INFORMACIÓN GENERAL (tag_group_id: 2)
  { tagId: 1, tagGroupId: 2, code: "C00.1.1", name: "Nombre comercial del negocio/propiedad", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, isRequired: true, placeholder: "Ej. Hotel Cayena Caracas / Posada Boutique" },
  { tagId: 2, tagGroupId: 2, code: "C00.1.2", name: "Nombre de la Embarcación", dataType: "string", countries: "ALL", allowedSubcategories: "15, 16", isSearchFilter: false, searchWeight: 0, isRequired: true, placeholder: "Ej. Catamarán Espíritu de Los Roques" },
  { tagId: 3, tagGroupId: 2, code: "C00.1.3", name: "Número de Licencia Turística / Registro (RTN)", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, isRequired: true, placeholder: "Ej. RTN-2026-00458" },
  { tagId: 4, tagGroupId: 2, code: "C00.1.4", name: "Sitio Web Oficial", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, placeholder: "https://..." },
  { tagId: 5, tagGroupId: 2, code: "C00.1.5", name: "Enlace FACEBOOK", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, placeholder: "https://facebook.com/..." },
  { tagId: 6, tagGroupId: 2, code: "C00.1.6", name: "Enlace INSTAGRAM", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, placeholder: "https://instagram.com/..." },
  { tagId: 7, tagGroupId: 2, code: "C00.1.7", name: "Enlace TIKTOK", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, placeholder: "https://tiktok.com/@..." },
  { tagId: 8, tagGroupId: 2, code: "C00.1.8", name: "Enlace YOUTUBE", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, placeholder: "https://youtube.com/..." },
  { tagId: 9, tagGroupId: 2, code: "C00.1.9", name: "Descripción o Reseña Comercial (Máx 500 caracteres)", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, isRequired: true, placeholder: "Describe la experiencia única de tu alojamiento..." },
  { tagId: 10, tagGroupId: 2, code: "C00.1.10", name: "Año de construcción", dataType: "integer", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, placeholder: "Ej. 2018" },
  { tagId: 11, tagGroupId: 2, code: "C00.1.11", name: "Año de última reforma", dataType: "integer", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, placeholder: "Ej. 2025" },
  { tagId: 12, tagGroupId: 2, code: "C00.1.12", name: "Capacidad total en Plazas / Plazas de Cama", dataType: "integer", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, isRequired: true, placeholder: "Ej. 60" },
  { tagId: 13, tagGroupId: 2, code: "C00.1.13", name: "Capacidad en Habitaciones", dataType: "integer", countries: "ALL", allowedSubcategories: "1-4, 6", isSearchFilter: false, searchWeight: 0, isRequired: true, placeholder: "Ej. 24" },
  { tagId: 14, tagGroupId: 2, code: "C00.1.14", name: "Capacidad en Suites", dataType: "integer", countries: "ALL", allowedSubcategories: "1-4, 6", isSearchFilter: false, searchWeight: 0, isRequired: true, placeholder: "Ej. 6" },
  { tagId: 15, tagGroupId: 2, code: "C00.1.15", name: "Capacidad de Cápsulas", dataType: "integer", countries: "ALL", allowedSubcategories: "5", isSearchFilter: false, searchWeight: 0, isRequired: true, placeholder: "Ej. 40" },
  { tagId: 16, tagGroupId: 2, code: "C00.1.16", name: "Capacidad en Unidades habitacionales (casas, apartamentos, cabañas)", dataType: "integer", countries: "ALL", allowedSubcategories: "7-10", isSearchFilter: false, searchWeight: 0, isRequired: true, placeholder: "Ej. 18" },
  { tagId: 17, tagGroupId: 2, code: "C00.1.17", name: "Número máximo de comensales (Restaurantes)", dataType: "integer", countries: "ALL", allowedSubcategories: "31, 32, 33", isSearchFilter: false, searchWeight: 0, isRequired: true, placeholder: "Ej. 120" },

  // C00.1.18 DIRECCIÓN POSTAL (tag_group_id: 3)
  { tagId: 18, tagGroupId: 3, code: "C00.1.18.1", name: "Tipo de Vía", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, isRequired: true },
  { tagId: 19, tagGroupId: 3, code: "C00.1.18.2", name: "Nombre de la Vía", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, isRequired: true, placeholder: "Ej. Av. Don Eugenio Mendoza" },
  { tagId: 20, tagGroupId: 3, code: "C00.1.18.3", name: "Número / Km", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, placeholder: "Ej. Nro. 14" },
  { tagId: 27, tagGroupId: 3, code: "C00.1.18.10", name: "Municipio", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, isRequired: true, placeholder: "Ej. Chacao / Madrid" },
  { tagId: 28, tagGroupId: 3, code: "C00.1.18.11", name: "Localidad / Ciudad", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, isRequired: true, placeholder: "Ej. Caracas / Barcelona" },
  { tagId: 26, tagGroupId: 3, code: "C00.1.18.9", name: "Provincia (España)", dataType: "string", countries: "ES", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, isRequired: true, placeholder: "Ej. Madrid / Islas Baleares / Málaga" },
  { tagId: 29, tagGroupId: 3, code: "C00.1.18.12", name: "Estado (Venezuela)", dataType: "string", countries: "VE", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, isRequired: true, placeholder: "Ej. Miranda / Nueva Esparta" },
  { tagId: 30, tagGroupId: 3, code: "C00.1.18.13", name: "Parroquia", dataType: "string", countries: "VE", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, placeholder: "Ej. Chacao" },
  { tagId: 31, tagGroupId: 3, code: "C00.1.18.14", name: "Sector / Urbanización", dataType: "string", countries: "VE", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, placeholder: "Ej. La Castellana" },
  { tagId: 33, tagGroupId: 3, code: "C00.1.18.16", name: "Nombre de edificación / Quinta / Torre", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, placeholder: "Ej. Edificio Cayena" },
  { tagId: 34, tagGroupId: 3, code: "C00.1.18.17", name: "Punto de referencia / Complemento dirección", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, placeholder: "Entre calles El Bosque y José Ángel Lamas" },
  { tagId: 35, tagGroupId: 3, code: "C00.1.18.18", name: "Código Postal", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, placeholder: "Ej. 1060" },

  // C00.1.20 PUERTO / EMBARCACIÓN (tag_group_id: 5)
  { tagId: 36, tagGroupId: 5, code: "C00.1.20.2", name: "Nombre del Puerto Deportivo, Marina o Club Náutico", dataType: "string", countries: "ALL", allowedSubcategories: "15, 16", isSearchFilter: true, searchWeight: 60, isRequired: true, placeholder: "Ej. Marina Americo Vespucio / Tucacas" },
  { tagId: 37, tagGroupId: 5, code: "C00.1.20.3", name: "Número o Letra de Pantalán / Muelle (Pier / Dock)", dataType: "string", countries: "ALL", allowedSubcategories: "15, 16", isSearchFilter: false, searchWeight: 0, isRequired: true, placeholder: "Ej. Muelle B" },
  { tagId: 38, tagGroupId: 5, code: "C00.1.20.4", name: "Número de Amarre o Puesto de Atraque (Slip)", dataType: "string", countries: "ALL", allowedSubcategories: "15, 16", isSearchFilter: false, searchWeight: 0, isRequired: true, placeholder: "Ej. Puesto 12" },
  { tagId: 39, tagGroupId: 2, code: "C00.1.21", name: "Coordenadas GPS (Latitud, Longitud)", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, isRequired: true, placeholder: "Ej. 10.4998, -66.8517" },
  { tagId: 40, tagGroupId: 2, code: "C00.1.22", name: "Indicaciones prácticas de acceso", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, placeholder: "Ej. Acceso pavimentado, recepción frente a la plaza..." },
  { tagId: 41, tagGroupId: 2, code: "C00.1.23", name: "Punto de Encuentro y Tipo de Acceso en Marina", dataType: "string", countries: "ALL", allowedSubcategories: "15, 16", isSearchFilter: false, searchWeight: 0, placeholder: "Ej. Capitanía del puerto con pase magnético" },

  // C00.1.24 ENTORNO (tag_group_id: 7)
  { tagId: 42, tagGroupId: 7, code: "C00.1.24.1", name: "Entorno: Mar / Playa", dataType: "boolean", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 70 },
  { tagId: 43, tagGroupId: 7, code: "C00.1.24.2", name: "Entorno: Campiña / Rural", dataType: "boolean", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 50 },
  { tagId: 44, tagGroupId: 7, code: "C00.1.24.3", name: "Entorno: Bosque / Selva", dataType: "boolean", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 50 },
  { tagId: 45, tagGroupId: 7, code: "C00.1.24.4", name: "Entorno: Montaña / Cordillera", dataType: "boolean", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 70 },
  { tagId: 46, tagGroupId: 7, code: "C00.1.24.5", name: "Entorno: Río o Lago", dataType: "boolean", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 60 },
  { tagId: 47, tagGroupId: 7, code: "C00.1.24.6", name: "Entorno: Zona Urbana / Financiera", dataType: "boolean", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 50 },
  { tagId: 48, tagGroupId: 7, code: "C00.1.24.7", name: "Entorno: Llanos", dataType: "boolean", countries: "VE", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 50 },
  { tagId: 49, tagGroupId: 7, code: "C00.1.24.8", name: "Entorno: Gran Sabana / Tepuyes", dataType: "boolean", countries: "VE", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 50 },
  { tagId: 50, tagGroupId: 7, code: "C00.1.24.9", name: "Entorno: Médanos / Desierto", dataType: "boolean", countries: "VE", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 50 },

  // C00.1.25 REGIONES CLAVE EN VENEZUELA (tag_group_id: 8)
  { tagId: 51, tagGroupId: 8, code: "C00.1.25.1", name: "Archipiélago de Los Roques", dataType: "boolean", countries: "VE", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 50 },
  { tagId: 52, tagGroupId: 8, code: "C00.1.25.2", name: "Isla de Margarita y Coche (Región Insular)", dataType: "boolean", countries: "VE", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 50 },
  { tagId: 53, tagGroupId: 8, code: "C00.1.25.3", name: "Parque Nacional Morrocoy y Costa de Falcón", dataType: "boolean", countries: "VE", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 50 },
  { tagId: 54, tagGroupId: 8, code: "C00.1.25.4", name: "Los Andes Venezolanos (Mérida, Trujillo y Táchira)", dataType: "boolean", countries: "VE", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 50 },
  { tagId: 55, tagGroupId: 8, code: "C00.1.25.5", name: "Parque Nacional Canaima y La Gran Sabana (Región Guayana)", dataType: "boolean", countries: "VE", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 50 },
  { tagId: 56, tagGroupId: 8, code: "C00.1.25.6", name: "Costa Central y Parque Nacional Henri Pittier (Aragua y La Guaira)", dataType: "boolean", countries: "VE", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 50 },
  { tagId: 57, tagGroupId: 8, code: "C00.1.25.7", name: "Oriente Costero y Parque Nacional Mochima (Anzoátegui y Sucre)", dataType: "boolean", countries: "VE", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 50 },
  { tagId: 58, tagGroupId: 8, code: "C00.1.25.8", name: "Los Llanos Venezolanos", dataType: "boolean", countries: "VE", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 50 },

  // C00.1.26 REGIONES CLAVE EN ESPAÑA (tag_group_id: 9)
  { tagId: 59, tagGroupId: 9, code: "C00.1.26.1", name: "Islas Baleares (Mallorca, Menorca, Ibiza, Formentera)", dataType: "boolean", countries: "ES", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 50 },
  { tagId: 60, tagGroupId: 9, code: "C00.1.26.2", name: "Islas Canarias (Tenerife, Gran Canaria, Lanzarote, Fuerteventura)", dataType: "boolean", countries: "ES", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 50 },
  { tagId: 61, tagGroupId: 9, code: "C00.1.26.3", name: "Costa del Sol y Andalucía", dataType: "boolean", countries: "ES", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 50 },
  { tagId: 62, tagGroupId: 9, code: "C00.1.26.4", name: "Costa Brava y Cataluña", dataType: "boolean", countries: "ES", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 50 },
  { tagId: 63, tagGroupId: 9, code: "C00.1.26.5", name: "Costa Blanca y Comunidad Valenciana", dataType: "boolean", countries: "ES", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 50 },
  { tagId: 64, tagGroupId: 9, code: "C00.1.26.6", name: "España Verde y Cornisa Cantábrica (Galicia, Asturias, Cantabria, País Vasco)", dataType: "boolean", countries: "ES", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 50 },
  { tagId: 65, tagGroupId: 9, code: "C00.1.26.7", name: "Pirineos (Aragón, Cataluña, Navarra)", dataType: "boolean", countries: "ES", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 50 },
  { tagId: 66, tagGroupId: 9, code: "C00.1.26.8", name: "Madrid y Centro Peninsular", dataType: "boolean", countries: "ES", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 50 },

  // C00.2 DATOS FISCALES (tag_group_id: 10)
  { tagId: 67, tagGroupId: 10, code: "C00.2.1", name: "Razón Social", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, isRequired: true, placeholder: "Ej. Inversora Hotelera C.A. / S.L." },
  { tagId: 68, tagGroupId: 10, code: "C00.2.2", name: "Nombre del Titular / Representante Legal", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, isRequired: true, placeholder: "Ej. Juan Pérez García" },
  { tagId: 69, tagGroupId: 10, code: "C00.2.3", name: "RIF (Venezuela) / NIF-CIF (España) — Identificación Fiscal", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, isRequired: true, placeholder: "Ej. J-40123456-7 (VE) / B-12345678 (ES)" },
  { tagId: 70, tagGroupId: 10, code: "C00.2.6", name: "Email para facturación administrativa", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, isRequired: true, placeholder: "administracion@hotel.com" },

  // C00.3.1 CONTACTO CON HDV (tag_group_id: 14)
  { tagId: 71, tagGroupId: 14, code: "C00.3.1.1", name: "Nombre y Apellidos de Persona de contacto con HDV", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, isRequired: true, placeholder: "Ej. María Rodríguez" },
  { tagId: 72, tagGroupId: 14, code: "C00.3.1.2", name: "Cargo de la persona de contacto con HDV", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, isRequired: true, placeholder: "Ej. Gerente General / Director de Reservas" },
  { tagId: 73, tagGroupId: 14, code: "C00.3.1.3", name: "Teléfono Directo HDV", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, isRequired: true, placeholder: "+58 414 0000000" },
  { tagId: 74, tagGroupId: 14, code: "C00.3.1.4", name: "Horario de atención HDV (Desde - Hasta)", dataType: "range", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, isRequired: true, placeholder: "08:00 - 18:00" },
  { tagId: 75, tagGroupId: 14, code: "C00.3.1.5", name: "Email de contacto con HDV", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, isRequired: true, placeholder: "gerencia@hotel.com" },
  { tagId: 76, tagGroupId: 14, code: "C00.3.1.6", name: "WhatsApp Directo con HDV", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, isRequired: true, placeholder: "+58 414 0000000" },

  // C00.3.2 CONTACTO CON CLIENTES (tag_group_id: 15)
  { tagId: 77, tagGroupId: 15, code: "C00.3.2.1", name: "Nombre de Persona o Departamento de Atención al Huésped", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, placeholder: "Central de Reservas" },
  { tagId: 78, tagGroupId: 15, code: "C00.3.2.2", name: "Cargo de atención a clientes", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, placeholder: "Jefe de Recepción" },
  { tagId: 79, tagGroupId: 15, code: "C00.3.2.3", name: "Teléfono de Recepción / Emergencias 24h", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, placeholder: "+58 212 0000000" },
  { tagId: 80, tagGroupId: 15, code: "C00.3.2.4", name: "Horario de atención a clientes", dataType: "range", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, placeholder: "24 Horas / 07:00 - 22:00" },
  { tagId: 81, tagGroupId: 15, code: "C00.3.2.5", name: "Email para recepción de reservas", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, isRequired: true, placeholder: "reservas@hotel.com" },
  { tagId: 82, tagGroupId: 15, code: "C00.3.2.6", name: "WhatsApp Directo con Clientes (Reservas 0% Comisiones)", dataType: "string", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, isRequired: true, placeholder: "+58 412 0000000" },

  // C00.4 CALIFICACIONES OFICIALES (tag_group_id: 16)
  { tagId: 83, tagGroupId: 16, code: "C00.4.1", name: "Estrellas Hoteleras (1 a 5)", dataType: "integer", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 90, placeholder: "5" },
  { tagId: 84, tagGroupId: 16, code: "C00.4.2", name: "Llaves Michelín Hoteles (1 a 3)", dataType: "integer", countries: "ES", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 85, placeholder: "2" },
  { tagId: 85, tagGroupId: 16, code: "C00.4.3", name: "Estrellas Hostales, Moteles y Pensiones (1 a 3)", dataType: "integer", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 60, placeholder: "3" },
  { tagId: 86, tagGroupId: 16, code: "C00.4.4", name: "Estrellas Posadas Venezolanas (1 a 4)", dataType: "integer", countries: "VE", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 80, placeholder: "4" },
  { tagId: 87, tagGroupId: 16, code: "C00.4.5", name: "Estrellas Alojamientos Rurales / Hatos (1 a 4)", dataType: "integer", countries: "VE", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 60, placeholder: "4" },
  { tagId: 88, tagGroupId: 16, code: "C00.4.6", name: "Espigas Casas Rurales España (1 a 5)", dataType: "integer", countries: "ES", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 70, placeholder: "4" },
  { tagId: 89, tagGroupId: 16, code: "C00.4.7", name: "Categoría de Camping y Glamping (1ª a 3ª)", dataType: "integer", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 80, placeholder: "1" },
  { tagId: 90, tagGroupId: 16, code: "C00.4.8", name: "Llaves Turísticas (1 a 4)", dataType: "integer", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 60, placeholder: "4" },
  { tagId: 91, tagGroupId: 16, code: "C00.4.9", name: "Tenedores Oficiales (Gastronomía)", dataType: "integer", countries: "ALL", allowedSubcategories: "31, 32, 33", isSearchFilter: true, searchWeight: 90, placeholder: "5" },
  { tagId: 92, tagGroupId: 16, code: "C00.4.10", name: "Estrellas Michelín (Gastronomía 1 a 3)", dataType: "integer", countries: "ES", allowedSubcategories: "31, 32, 33", isSearchFilter: true, searchWeight: 95, placeholder: "2" },
  { tagId: 93, tagGroupId: 16, code: "C00.4.11", name: "Soles Guía Repsol (1 a 3)", dataType: "integer", countries: "ES", allowedSubcategories: "31, 32, 33", isSearchFilter: true, searchWeight: 85, placeholder: "2" },

  // C00.5 CERTIFICACIONES Y SELLO HDV (tag_group_id: 17)
  { tagId: 94, tagGroupId: 17, code: "C00.5.1", name: "Certificación de Sostenibilidad", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-42", isSearchFilter: true, searchWeight: 50 },
  { tagId: 95, tagGroupId: 17, code: "C00.5.2", name: "Circuito de la Excelencia Venezuela", dataType: "boolean", countries: "VE", allowedSubcategories: "1-42", isSearchFilter: true, searchWeight: 40 },
  { tagId: 96, tagGroupId: 17, code: "C00.5.3", name: "Llave Verde (Green Key)", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-42", isSearchFilter: true, searchWeight: 40 },
  { tagId: 97, tagGroupId: 17, code: "C00.5.4", name: "Etiqueta Ecológica", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-42", isSearchFilter: true, searchWeight: 50 },
  { tagId: 98, tagGroupId: 17, code: "C00.5.5", name: "Certificación Pet-Friendly (Qualidog)", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-42", isSearchFilter: true, searchWeight: 60 },
  { tagId: 99, tagGroupId: 17, code: "C00.5.6", name: "Certificación Cicloturismo (Accueil Vélo / Bikefriendly)", dataType: "boolean", countries: "ES", allowedSubcategories: "1-42", isSearchFilter: true, searchWeight: 55 },
  { tagId: 100, tagGroupId: 17, code: "C00.5.7", name: "Turismo y Accesibilidad Certificada", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-42", isSearchFilter: true, searchWeight: 70 },
  { tagId: 101, tagGroupId: 17, code: "C00.5.8", name: "Alojamiento / Operador de Pesca Deportiva", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-42", isSearchFilter: true, searchWeight: 60 },
  { tagId: 102, tagGroupId: 17, code: "C00.5.9", name: "Sello de Garantía Legal y Verificación Humana HDV", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-42", isSearchFilter: true, searchWeight: 80 },

  // C01.1 BIENESTAR, SALUD Y RELAX (tag_group_id: 21)
  { tagId: 114, tagGroupId: 21, code: "C01.1.1", name: "Piscina exterior", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-14", isSearchFilter: true, searchWeight: 100 },
  { tagId: 115, tagGroupId: 21, code: "C01.1.2", name: "Piscina interior (climatizada)", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-14", isSearchFilter: true, searchWeight: 95 },
  { tagId: 116, tagGroupId: 21, code: "C01.1.3", name: "Spa & Wellness Center", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-14", isSearchFilter: true, searchWeight: 90 },
  { tagId: 117, tagGroupId: 21, code: "C01.1.4", name: "Sauna", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-14", isSearchFilter: true, searchWeight: 75 },
  { tagId: 118, tagGroupId: 21, code: "C01.1.5", name: "Baño turco / Hammam", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-14", isSearchFilter: true, searchWeight: 70 },
  { tagId: 119, tagGroupId: 21, code: "C01.1.6", name: "Gimnasio equipado", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-14", isSearchFilter: true, searchWeight: 80 },
  { tagId: 120, tagGroupId: 21, code: "C01.1.7", name: "Zona de Yoga y Meditación", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-14", isSearchFilter: true, searchWeight: 50 },
  { tagId: 121, tagGroupId: 21, code: "C01.1.8", name: "Solárium con tumbonas", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-14", isSearchFilter: true, searchWeight: 60 },

  // C01.2 OCIO Y ESPACIOS SOCIALES (tag_group_id: 22)
  { tagId: 122, tagGroupId: 22, code: "C01.2.1", name: "Salón de uso común con TV", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-14", isSearchFilter: false, searchWeight: 0 },
  { tagId: 123, tagGroupId: 22, code: "C01.2.2", name: "Sala de juegos (Billar, Dardos, Futbolín)", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-14", isSearchFilter: true, searchWeight: 60 },
  { tagId: 125, tagGroupId: 22, code: "C01.2.4", name: "Zona de barbacoa / Parrillera", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-14", isSearchFilter: true, searchWeight: 70 },
  { tagId: 126, tagGroupId: 22, code: "C01.2.5", name: "Parque infantil", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-14", isSearchFilter: true, searchWeight: 75 },
  { tagId: 127, tagGroupId: 22, code: "C01.2.6", name: "Jardines tropicales", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-14", isSearchFilter: false, searchWeight: 0 },
  { tagId: 128, tagGroupId: 22, code: "C01.2.7", name: "Parque acuático", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-14", isSearchFilter: true, searchWeight: 85 },
  { tagId: 129, tagGroupId: 22, code: "C01.2.8", name: "Toboganes de agua", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-14", isSearchFilter: true, searchWeight: 80 },
  { tagId: 131, tagGroupId: 22, code: "C01.2.10", name: "Canchas de tenis / Pádel", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-14", isSearchFilter: true, searchWeight: 60 },
  { tagId: 137, tagGroupId: 22, code: "C01.2.16", name: "Acceso directo a la playa", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-14", isSearchFilter: true, searchWeight: 95 },

  // C01.3 NEGOCIOS Y EVENTOS (tag_group_id: 23)
  { tagId: 139, tagGroupId: 23, code: "C01.3.1", name: "Salas de reuniones ejecutivas", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-10", isSearchFilter: true, searchWeight: 50 },
  { tagId: 141, tagGroupId: 23, code: "C01.3.3", name: "Salón de eventos y convenciones", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-10", isSearchFilter: true, searchWeight: 50 },
  { tagId: 142, tagGroupId: 23, code: "C01.3.4", name: "Zonas de Coworking de alta velocidad", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-10", isSearchFilter: true, searchWeight: 70 },

  // C01.4 ABASTECIMIENTO Y ENERGÍA (DIFERENCIADOR CRÍTICO VENEZUELA - tag_group_id: 24)
  { tagId: 143, tagGroupId: 24, code: "C01.4.1", name: "Planta Eléctrica 24/7 (Full Power)", dataType: "boolean", countries: "VE", allowedSubcategories: "1-16, 31-34", isSearchFilter: true, searchWeight: 100 },
  { tagId: 144, tagGroupId: 24, code: "C01.4.2", name: "Tanque de Agua continuo (Suministro 24/7)", dataType: "boolean", countries: "VE", allowedSubcategories: "1-16, 31-34", isSearchFilter: true, searchWeight: 100 },

  // C02.1 ATENCIÓN AL CLIENTE (tag_group_id: 26)
  { tagId: 145, tagGroupId: 26, code: "C02.1.1", name: "Recepción 24 horas", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-10", isSearchFilter: true, searchWeight: 85 },
  { tagId: 146, tagGroupId: 26, code: "C02.1.2", name: "Servicio de conserjería", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-10", isSearchFilter: true, searchWeight: 60 },
  { tagId: 147, tagGroupId: 26, code: "C02.1.3", name: "Guarda-equipaje", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-10", isSearchFilter: true, searchWeight: 60 },
  { tagId: 148, tagGroupId: 26, code: "C02.1.4", name: "Registro de entrada / salida exprés", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-10", isSearchFilter: true, searchWeight: 65 },
  { tagId: 150, tagGroupId: 26, code: "C02.1.6", name: "Cuna adicional en la habitación bajo petición", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-10", isSearchFilter: true, searchWeight: 70 },

  // C02.2 IDIOMAS (tag_group_id: 27)
  { tagId: 152, tagGroupId: 27, code: "C02.2.2", name: "Atención en Inglés", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16, 31-42", isSearchFilter: true, searchWeight: 80 },
  { tagId: 154, tagGroupId: 27, code: "C02.2.4", name: "Atención en Francés", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16, 31-42", isSearchFilter: true, searchWeight: 40 },
  { tagId: 155, tagGroupId: 27, code: "C02.2.5", name: "Atención en Portugués", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16, 31-42", isSearchFilter: true, searchWeight: 40 },

  // C02.3 HOSTELERÍA INTERNA (tag_group_id: 28)
  { tagId: 156, tagGroupId: 28, code: "C02.3.1", name: "Restaurante propio en el alojamiento", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-10", isSearchFilter: true, searchWeight: 90 },
  { tagId: 157, tagGroupId: 28, code: "C02.3.2", name: "Bar / Cafetería / Snack-Bar", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-10", isSearchFilter: true, searchWeight: 70 },
  { tagId: 158, tagGroupId: 28, code: "C02.3.3", name: "Bar en la piscina / Pool Bar", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-10", isSearchFilter: true, searchWeight: 65 },
  { tagId: 159, tagGroupId: 28, code: "C02.3.4", name: "Servicio de habitaciones (Room Service)", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-10", isSearchFilter: true, searchWeight: 70 },
  { tagId: 160, tagGroupId: 28, code: "C02.3.5", name: "Menús para dietas especiales (Vegetariano/Sin Gluten)", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-10", isSearchFilter: true, searchWeight: 60 },
  { tagId: 161, tagGroupId: 28, code: "C02.3.6", name: "Desayuno en la habitación", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-10", isSearchFilter: true, searchWeight: 60 },
  { tagId: 164, tagGroupId: 28, code: "C02.3.9", name: "Menú infantil disponible", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-10", isSearchFilter: true, searchWeight: 70 },

  // C02.4 LIMPIEZA Y LAVANDERÍA (tag_group_id: 29)
  { tagId: 165, tagGroupId: 29, code: "C02.4.1", name: "Servicio de limpieza diaria", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-14", isSearchFilter: true, searchWeight: 60 },
  { tagId: 166, tagGroupId: 29, code: "C02.4.2", name: "Servicio de Lavandería", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-14", isSearchFilter: true, searchWeight: 50 },
  { tagId: 168, tagGroupId: 29, code: "C02.4.4", name: "Servicio de Planchado", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-14", isSearchFilter: false, searchWeight: 0 },

  // C02.5 INTERNET (tag_group_id: 30)
  { tagId: 172, tagGroupId: 30, code: "C02.5.1", name: "Wi-Fi Gratis de alta velocidad / Starlink", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 100 },
  { tagId: 173, tagGroupId: 30, code: "C02.5.2", name: "Wi-Fi Premium de pago", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: false, searchWeight: 0 },

  // C02.6 MOVILIDAD Y PARKING (tag_group_id: 31)
  { tagId: 174, tagGroupId: 31, code: "C02.6.1", name: "Parking privado cubierto gratis", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16, 31-36", isSearchFilter: true, searchWeight: 95 },
  { tagId: 175, tagGroupId: 31, code: "C02.6.2", name: "Parking privado descubierto gratis", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16, 31-36", isSearchFilter: true, searchWeight: 90 },
  { tagId: 180, tagGroupId: 31, code: "C02.6.7", name: "Parking adaptado para movilidad reducida (PMR)", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16, 31-36", isSearchFilter: true, searchWeight: 60 },
  { tagId: 181, tagGroupId: 31, code: "C02.6.8", name: "Estación de carga de vehículos eléctricos", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16, 31-36", isSearchFilter: true, searchWeight: 85 },
  { tagId: 182, tagGroupId: 31, code: "C02.6.9", name: "Servicio de traslado al aeropuerto (Shuttle)", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 75 },
  { tagId: 184, tagGroupId: 31, code: "C02.6.11", name: "Servicio de alquiler de vehículos", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16, 31-36", isSearchFilter: true, searchWeight: 60 },

  // C02.7 ACTIVIDADES Y EXPERIENCIAS (tag_group_id: 32)
  { tagId: 185, tagGroupId: 32, code: "C02.7.1", name: "Rutas de senderismo y excursiones", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 50 },
  { tagId: 188, tagGroupId: 32, code: "C02.7.4", name: "Deportes acuáticos (Kitesurf, Windsurf, Paddle)", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 60 },
  { tagId: 192, tagGroupId: 32, code: "C02.7.8", name: "Música y espectáculos en vivo", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 65 },
  { tagId: 193, tagGroupId: 32, code: "C02.7.9", name: "Club infantil", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 80 },
  { tagId: 199, tagGroupId: 32, code: "C02.7.15", name: "Kayak / Canoa", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 65 },
  { tagId: 200, tagGroupId: 32, code: "C02.7.16", name: "Paseos en lancha a cayos / Snorkel", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 70 },

  // C03.1 ACCESIBILIDAD (tag_group_id: 34)
  { tagId: 202, tagGroupId: 34, code: "C03.1.1", name: "Todo el alojamiento accesible en silla de ruedas", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 90 },
  { tagId: 203, tagGroupId: 34, code: "C03.1.2", name: "Acceso a pisos superiores en ascensor", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 80 },
  { tagId: 204, tagGroupId: 34, code: "C03.1.3", name: "Unidades íntegramente en planta baja", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 70 },
  { tagId: 206, tagGroupId: 34, code: "C03.1.5", name: "WC público con barras de apoyo", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: false, searchWeight: 0 },

  // C03.2 SEGURIDAD (tag_group_id: 35)
  { tagId: 209, tagGroupId: 35, code: "C03.2.1", name: "Cámaras de seguridad CCTV en zonas comunes", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: false, searchWeight: 0 },
  { tagId: 210, tagGroupId: 35, code: "C03.2.2", name: "Detectores de humo", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: false, searchWeight: 0 },
  { tagId: 211, tagGroupId: 35, code: "C03.2.3", name: "Extintores verificados", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: false, searchWeight: 0 },
  { tagId: 212, tagGroupId: 35, code: "C03.2.4", name: "Personal de Seguridad Privada 24 horas", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 70 },
  { tagId: 213, tagGroupId: 35, code: "C03.2.5", name: "Tarjetas / Llaves de acceso electrónicas", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: false, searchWeight: 0 },
  { tagId: 214, tagGroupId: 35, code: "C03.2.6", name: "Caja fuerte principal en recepción", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: false, searchWeight: 0 },

  // C04.1 CHECK-IN, CHECK-OUT Y DOCUMENTACIÓN (tag_group_id: 37)
  { tagId: 215, tagGroupId: 37, code: "C04.1.1", name: "Horario de Check-In (Admisión)", dataType: "range", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: false, searchWeight: 0, placeholder: "De 15:00 a 22:00" },
  { tagId: 216, tagGroupId: 37, code: "C04.1.2", name: "Horario de Check-Out (Salida)", dataType: "range", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: false, searchWeight: 0, placeholder: "De 11:00 a 12:30" },
  { tagId: 217, tagGroupId: 37, code: "C04.1.3", name: "Early Check-In sujeto a disponibilidad gratis", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 50 },
  { tagId: 219, tagGroupId: 37, code: "C04.1.5", name: "Late Check-Out sujeto a disponibilidad gratis", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 50 },
  { tagId: 221, tagGroupId: 37, code: "C04.1.7", name: "Recepción de Check-In 24/7", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 75 },
  { tagId: 223, tagGroupId: 37, code: "C04.1.9", name: "Cédula de Identidad / Pasaporte vigente obligatorio en Check-In", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: false, searchWeight: 0 },
  { tagId: 224, tagGroupId: 37, code: "C04.1.10", name: "Ingreso de menores requiere Partida de Nacimiento o Autorización LOPNNA", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: false, searchWeight: 0 },

  // C04.2 MASCOTAS (tag_group_id: 38)
  { tagId: 225, tagGroupId: 38, code: "C04.2.1", name: "Admisión de mascotas gratis (Pet Friendly)", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 100 },
  { tagId: 226, tagGroupId: 38, code: "C04.2.2", name: "Admisión de mascotas bajo suplemento", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: false, searchWeight: 0 },
  { tagId: 228, tagGroupId: 38, code: "C04.2.4", name: "No se admiten mascotas", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 70 },

  // C04.3 PERFIL DE HUÉSPED (tag_group_id: 39)
  { tagId: 229, tagGroupId: 39, code: "C04.3.1", name: "Habitaciones Familiares (Apto para niños)", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-5, 7-12", isSearchFilter: true, searchWeight: 90 },
  { tagId: 230, tagGroupId: 39, code: "C04.3.2", name: "Solo para adultos / Parejas (+18)", dataType: "boolean", countries: "ALL", allowedSubcategories: "6", isSearchFilter: true, searchWeight: 90 },

  // C04.4 TABACO Y FIESTAS (tag_group_id: 40)
  { tagId: 232, tagGroupId: 40, code: "C04.4.1", name: "Espacio 100% Libre de Humo (Prohibido fumar en interiores)", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 60 },
  { tagId: 234, tagGroupId: 40, code: "C04.4.3", name: "No se permiten fiestas ni eventos no autorizados", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 70 },
  { tagId: 235, tagGroupId: 40, code: "C04.4.4", name: "Horario de silencio y descanso nocturno", dataType: "range", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: false, searchWeight: 0, placeholder: "23:00 a 07:00" },

  // C04.6 RÉGIMEN DE ESTANCIA (tag_group_id: 42)
  { tagId: 241, tagGroupId: 42, code: "C04.6.2", name: "Desayuno Criollo Venezolano incluido", dataType: "boolean", countries: "VE", allowedSubcategories: "1-5, 7-16", isSearchFilter: true, searchWeight: 80 },
  { tagId: 242, tagGroupId: 42, code: "C04.6.3", name: "Desayuno Buffet incluido", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-5, 7-16", isSearchFilter: true, searchWeight: 85 },
  { tagId: 243, tagGroupId: 42, code: "C04.6.4", name: "Desayuno Americano incluido", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-5, 7-16", isSearchFilter: true, searchWeight: 60 },
  { tagId: 244, tagGroupId: 42, code: "C04.6.5", name: "Desayuno Continental incluido", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-5, 7-16", isSearchFilter: true, searchWeight: 70 },
  { tagId: 246, tagGroupId: 42, code: "C04.6.7", name: "Desayuno Mediterráneo incluido", dataType: "boolean", countries: "ES", allowedSubcategories: "1-5, 7-16", isSearchFilter: true, searchWeight: 75 },
  { tagId: 247, tagGroupId: 42, code: "C04.6.8", name: "Todo Incluido (Pensión Completa: Todas las comidas)", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-5, 7-16", isSearchFilter: true, searchWeight: 95 },
  { tagId: 248, tagGroupId: 42, code: "C04.6.9", name: "Media Pensión (Desayuno y Cena incluidos)", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-5, 7-16", isSearchFilter: true, searchWeight: 80 },

  // C04.7 MÉTODOS Y PLATAFORMAS DE PAGO ACEPTADAS EN VENEZUELA (tag_group_id: 44, 45, 46)
  { tagId: 250, tagGroupId: 44, code: "C04.7.1.1", name: "Pago Móvil Interbancario (Bs. VES)", dataType: "boolean", countries: "VE", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 90, isRequired: true },
  { tagId: 251, tagGroupId: 44, code: "C04.7.1.2", name: "Tarjetas de Débito y Crédito Nacionales (Punto de Venta)", dataType: "boolean", countries: "VE", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 60 },
  { tagId: 252, tagGroupId: 45, code: "C04.7.2.1", name: "Efectivo en Dólares ($ USD)", dataType: "boolean", countries: "VE", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 85 },
  { tagId: 253, tagGroupId: 45, code: "C04.7.2.2", name: "Efectivo en Bolívares (VES)", dataType: "boolean", countries: "VE", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0 },
  { tagId: 254, tagGroupId: 45, code: "C04.7.2.3", name: "Efectivo en Euros (€)", dataType: "boolean", countries: "VE", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0 },
  { tagId: 255, tagGroupId: 45, code: "C04.7.2.4", name: "Pesos Colombianos (COP)", dataType: "boolean", countries: "VE", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 50 },
  { tagId: 256, tagGroupId: 46, code: "C04.7.3.1", name: "Zelle (Transferencia inmediata USD)", dataType: "boolean", countries: "VE", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 90 },
  { tagId: 257, tagGroupId: 46, code: "C04.7.3.2", name: "Binance Pay (USDT / Cripto)", dataType: "boolean", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 70 },
  { tagId: 258, tagGroupId: 46, code: "C04.7.3.3", name: "Banesco Panamá", dataType: "boolean", countries: "VE", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 60 },
  { tagId: 259, tagGroupId: 46, code: "C04.7.3.4", name: "Mercantil Panamá", dataType: "boolean", countries: "VE", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 60 },
  { tagId: 260, tagGroupId: 46, code: "C04.7.3.5", name: "Cuentas Custodia Nacionales en Divisas (Bancamiga / BNC / Banesco)", dataType: "boolean", countries: "VE", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0 },
  { tagId: 261, tagGroupId: 46, code: "C04.7.3.6", name: "Tarjetas Internacionales (Visa / Mastercard / Amex)", dataType: "boolean", countries: "VE", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 60 },

  // C04.8 MÉTODOS Y PLATAFORMAS DE PAGO ACEPTADAS EN ESPAÑA (tag_group_id: 47)
  { tagId: 262, tagGroupId: 47, code: "C04.8.1", name: "Tarjetas Bancarias (Visa, Mastercard, Maestro, Amex - TPV Europeo)", dataType: "boolean", countries: "ES", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 95, isRequired: true },
  { tagId: 263, tagGroupId: 47, code: "C04.8.2", name: "Apple Pay", dataType: "boolean", countries: "ES", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 80 },
  { tagId: 264, tagGroupId: 47, code: "C04.8.3", name: "Google Pay", dataType: "boolean", countries: "ES", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 80 },
  { tagId: 265, tagGroupId: 47, code: "C04.8.4", name: "PayPal", dataType: "boolean", countries: "ES", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 70 },
  { tagId: 266, tagGroupId: 47, code: "C04.8.5", name: "Bizum (Pagos instantáneos en España)", dataType: "boolean", countries: "ES", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 95 },
  { tagId: 267, tagGroupId: 47, code: "C04.8.6", name: "Transferencia Bancaria SEPA Inmediata", dataType: "boolean", countries: "ES", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 65 },
  { tagId: 268, tagGroupId: 47, code: "C04.8.7", name: "Pay by Link (Enlace de pago seguro PSD2)", dataType: "boolean", countries: "ES", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0 },
  { tagId: 269, tagGroupId: 47, code: "C04.8.8", name: "Efectivo en Euros (€) — Límite legal vigente máx. 1.000 € (Ley Antifraude España)", dataType: "boolean", countries: "ES", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0 },
  { tagId: 270, tagGroupId: 47, code: "C04.8.9", name: "Pago Fraccionado BNPL (Klarna, Sequra, Aplazame)", dataType: "boolean", countries: "ES", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 60 },
  { tagId: 271, tagGroupId: 47, code: "C04.8.10", name: "Criptomonedas (TPVs regulados MiCA)", dataType: "boolean", countries: "ES", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 50 },

  // C04.9 CONDICIONES DE LA RESERVA (tag_group_id: 48)
  { tagId: 272, tagGroupId: 48, code: "C04.9.1", name: "Prepago 50% para garantizar la reserva", dataType: "boolean", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0, isRequired: true },
  { tagId: 273, tagGroupId: 48, code: "C04.9.2", name: "Prepago 100% para garantizar la reserva", dataType: "boolean", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0 },
  { tagId: 274, tagGroupId: 48, code: "C04.9.3", name: "Depósito de garantía reembolsable requerido", dataType: "boolean", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0 },
  { tagId: 276, tagGroupId: 48, code: "C04.9.5", name: "Cambio de fecha sin costo sujeto a disponibilidad", dataType: "boolean", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 70 },
  { tagId: 277, tagGroupId: 48, code: "C04.9.6", name: "Cancelación gratuita hasta 24h antes", dataType: "boolean", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 100 },
  { tagId: 278, tagGroupId: 48, code: "C04.9.7", name: "Cancelación gratuita hasta 48h antes", dataType: "boolean", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 95 },
  { tagId: 279, tagGroupId: 48, code: "C04.9.8", name: "Cancelación gratuita hasta 3 días antes", dataType: "boolean", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 90 },
  { tagId: 283, tagGroupId: 48, code: "C04.9.12", name: "Cancelación gratuita hasta 7 días antes", dataType: "boolean", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 70 },
  { tagId: 285, tagGroupId: 48, code: "C04.9.14", name: "Nota de crédito a favor válida hasta por 3 meses", dataType: "boolean", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: false, searchWeight: 0 },
  { tagId: 289, tagGroupId: 48, code: "C04.9.18", name: "Reservas directas sin tarjeta de crédito", dataType: "boolean", countries: "ALL", allowedSubcategories: "ALL", isSearchFilter: true, searchWeight: 90 },

  // C04.10 CONDICIONES DE NIÑOS (tag_group_id: 49)
  { tagId: 291, tagGroupId: 49, code: "C04.10.1", name: "Se pueden alojar niños de cualquier edad", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-5, 7-16", isSearchFilter: true, searchWeight: 60, isRequired: true },
  { tagId: 292, tagGroupId: 49, code: "C04.10.2", name: "Edad a partir de la cual los niños pagan como adultos", dataType: "integer", countries: "ALL", allowedSubcategories: "1-5, 7-16", isSearchFilter: false, searchWeight: 0, placeholder: "Ej. 12 años" },

  // C05 DISTRIBUCIÓN DE LA UNIDAD (tag_group_id: 50)
  { tagId: 293, tagGroupId: 50, code: "C05.1", name: "Nombre comercial de la Habitación / Unidad", dataType: "string", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: false, searchWeight: 0, placeholder: "Ej. Suite Ejecutiva con Vista al Ávila" },
  { tagId: 297, tagGroupId: 50, code: "C05.5", name: "Ocupación máxima (Huéspedes)", dataType: "integer", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 70, placeholder: "Ej. 4" },
  { tagId: 298, tagGroupId: 50, code: "C05.6", name: "Tamaño de la unidad en m²", dataType: "integer", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: false, searchWeight: 0, placeholder: "Ej. 55" },
  { tagId: 300, tagGroupId: 50, code: "C05.8", name: "Número de dormitorios independientes", dataType: "integer", countries: "ALL", allowedSubcategories: "11-14", isSearchFilter: true, searchWeight: 90, placeholder: "Ej. 3" },
  { tagId: 301, tagGroupId: 50, code: "C05.9", name: "Número de camarotes (Embarcaciones)", dataType: "integer", countries: "ALL", allowedSubcategories: "15, 16", isSearchFilter: true, searchWeight: 90, placeholder: "Ej. 4" },
  { tagId: 303, tagGroupId: 50, code: "C05.11", name: "Baño privado dentro de la unidad", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 40 },
  { tagId: 309, tagGroupId: 50, code: "C05.17", name: "Cocina grande privada equipada", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-14", isSearchFilter: true, searchWeight: 40 },
  { tagId: 310, tagGroupId: 50, code: "C05.18", name: "Kitchenette / Mini cocina privada", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-14", isSearchFilter: true, searchWeight: 40 },
  { tagId: 314, tagGroupId: 50, code: "C05.23", name: "Camas dobles King Size (2,00 x 2,00 m)", dataType: "integer", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 85, placeholder: "1" },
  { tagId: 315, tagGroupId: 50, code: "C05.24", name: "Camas dobles Queen Size (2,00 x 1,80 m)", dataType: "integer", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 80, placeholder: "1" },
  { tagId: 313, tagGroupId: 50, code: "C05.22", name: "Camas individuales (2,00 x 1,00 m)", dataType: "integer", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 70, placeholder: "2" },

  // C06 EQUIPAMIENTO DE LA UNIDAD (tag_group_id: 53, 54, 55, 56, 57, 59, 61)
  { tagId: 322, tagGroupId: 53, code: "C06.1.1.1", name: "Lencería y ropa de cama de alta gama", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: false, searchWeight: 0 },
  { tagId: 325, tagGroupId: 53, code: "C06.1.1.4", name: "Walk-in closet / Vestier", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 40 },
  { tagId: 328, tagGroupId: 53, code: "C06.1.1.7", name: "Insonorización acústica", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 60 },
  { tagId: 329, tagGroupId: 53, code: "C06.1.1.8", name: "Cortinas Blackout / Persianas opacas", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 40 },
  { tagId: 338, tagGroupId: 54, code: "C06.1.2.1", name: "Aire Acondicionado Split / Central", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 100 },
  { tagId: 339, tagGroupId: 54, code: "C06.1.2.2", name: "Calefacción (Clima de montaña)", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 90 },
  { tagId: 343, tagGroupId: 54, code: "C06.1.2.6", name: "Cargadores USB integrados junto a la cama", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 40 },
  { tagId: 344, tagGroupId: 55, code: "C06.1.3.1", name: "Smart TV Pantalla Plana", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 70 },
  { tagId: 345, tagGroupId: 55, code: "C06.1.3.2", name: "Servicios de Streaming (Netflix, Disney+, Max)", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 60 },
  { tagId: 352, tagGroupId: 56, code: "C06.1.4.1", name: "Escritorio ejecutivo de trabajo", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 70 },
  { tagId: 356, tagGroupId: 56, code: "C06.1.4.5", name: "Caja fuerte digital (Tamaño Laptop)", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 50 },
  { tagId: 358, tagGroupId: 57, code: "C06.2.1", name: "Balcón con vista panorámica", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 80 },
  { tagId: 359, tagGroupId: 57, code: "C06.2.2", name: "Terraza privada", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 85 },
  { tagId: 365, tagGroupId: 57, code: "C06.2.8", name: "Terraza con Jacuzzi / Piscina privada", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 90 },
  { tagId: 372, tagGroupId: 59, code: "C06.3.1.7", name: "Hidromasaje / Jacuzzi privado en baño", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 95 },
  { tagId: 373, tagGroupId: 59, code: "C06.3.1.8", name: "Secador de pelo profesional", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 70 },
  { tagId: 376, tagGroupId: 59, code: "C06.3.1.11", name: "Artículos de aseo gratuitos de cortesía", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 50 },
  { tagId: 377, tagGroupId: 59, code: "C06.3.1.12", name: "Bidet en cuarto de baño", dataType: "boolean", countries: "ES", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 55 },
  { tagId: 389, tagGroupId: 61, code: "C06.3.3.2", name: "Cafetera Espresso", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 60 },
  { tagId: 396, tagGroupId: 61, code: "C06.3.3.9", name: "Nevera ejecutiva / Minibar", dataType: "boolean", countries: "ALL", allowedSubcategories: "1-16", isSearchFilter: true, searchWeight: 65 },

  // C07 AGRUPACIÓN DE UNIDADES HABITACIONALES (tag_group_id: 62)
  { tagId: 402, tagGroupId: 62, code: "C07.1", name: "Panadería / Café en el recinto", dataType: "boolean", countries: "ALL", allowedSubcategories: "7-10", isSearchFilter: true, searchWeight: 50 },
  { tagId: 403, tagGroupId: 62, code: "C07.2", name: "Bodegón / Mini-mercado en el complejo", dataType: "boolean", countries: "ALL", allowedSubcategories: "7-10", isSearchFilter: true, searchWeight: 70 },
  { tagId: 407, tagGroupId: 62, code: "C07.6", name: "Conexión eléctrica individual en parcela", dataType: "boolean", countries: "ALL", allowedSubcategories: "7-10", isSearchFilter: true, searchWeight: 85 },
  { tagId: 408, tagGroupId: 62, code: "C07.7", name: "Conexión de agua potable en parcela", dataType: "boolean", countries: "ALL", allowedSubcategories: "7-10", isSearchFilter: true, searchWeight: 80 },

  // C08 LOVE HOTELS Y MOTELES (tag_group_id: 63)
  { tagId: 410, tagGroupId: 63, code: "C08.1.1", name: "Cama King/Queen Size con colchón reforzado", dataType: "boolean", countries: "ALL", allowedSubcategories: "6", isSearchFilter: false, searchWeight: 0 },
  { tagId: 411, tagGroupId: 63, code: "C08.1.2", name: "Sillón Tantra", dataType: "boolean", countries: "ALL", allowedSubcategories: "6", isSearchFilter: true, searchWeight: 85 },
  { tagId: 415, tagGroupId: 63, code: "C08.3.1", name: "Iluminación LED regulable por escenas", dataType: "boolean", countries: "ALL", allowedSubcategories: "6", isSearchFilter: true, searchWeight: 65 },
  { tagId: 417, tagGroupId: 63, code: "C08.4.1", name: "Garaje privado individual con puerta automática (Auto-Check-In)", dataType: "boolean", countries: "ALL", allowedSubcategories: "6", isSearchFilter: true, searchWeight: 95 },
  { tagId: 418, tagGroupId: 63, code: "C08.4.2", name: "Torno / Pass-through Box de entrega anónimo", dataType: "boolean", countries: "ALL", allowedSubcategories: "6", isSearchFilter: true, searchWeight: 80 },

  // C09 CASAS DE MONTAÑA (tag_group_id: 68)
  { tagId: 420, tagGroupId: 68, code: "C09.1.1", name: "Chimenea de leña tradicional", dataType: "boolean", countries: "ALL", allowedSubcategories: "12", isSearchFilter: true, searchWeight: 90 },
  { tagId: 422, tagGroupId: 68, code: "C09.1.3", name: "Lencería térmica de alta montaña", dataType: "boolean", countries: "ALL", allowedSubcategories: "12", isSearchFilter: false, searchWeight: 0 },
  { tagId: 428, tagGroupId: 68, code: "C09.4.1", name: "Jacuzzi exterior climatizado con vista a la montaña", dataType: "boolean", countries: "ALL", allowedSubcategories: "12", isSearchFilter: true, searchWeight: 95 },

  // C10 BARCOS CON ALOJAMIENTO ESTÁTICO EN PUERTO (tag_group_id: 77 - SCS-15)
  { tagId: 441, tagGroupId: 77, code: "C10.1", name: "Conexión permanente a electricidad de tierra (Shore Power 220V/110V)", dataType: "boolean", countries: "ALL", allowedSubcategories: "15", isSearchFilter: true, searchWeight: 80 },
  { tagId: 442, tagGroupId: 77, code: "C10.2", name: "Conexión directa a red de agua potable del puerto", dataType: "boolean", countries: "ALL", allowedSubcategories: "15", isSearchFilter: true, searchWeight: 80 },
  { tagId: 443, tagGroupId: 77, code: "C10.3", name: "Acceso a duchas, vestuarios y sanitarios VIP de la Marina", dataType: "boolean", countries: "ALL", allowedSubcategories: "15", isSearchFilter: true, searchWeight: 70 },
  { tagId: 444, tagGroupId: 77, code: "C10.4", name: "Pasarela de acceso estable e iluminada desde el pantalán", dataType: "boolean", countries: "ALL", allowedSubcategories: "15", isSearchFilter: false, searchWeight: 0 },
  { tagId: 445, tagGroupId: 77, code: "C10.5", name: "Servicio de conserjería y vigilancia de marina 24h", dataType: "boolean", countries: "ALL", allowedSubcategories: "15", isSearchFilter: true, searchWeight: 75 },
  { tagId: 446, tagGroupId: 77, code: "C10.6", name: "Entrega de comida y catering directamente al amarre", dataType: "boolean", countries: "ALL", allowedSubcategories: "15", isSearchFilter: true, searchWeight: 65 },

  // C11 EMBARCACIONES Y SERVICIOS NÁUTICOS (tag_group_id: 78)
  { tagId: 447, tagGroupId: 78, code: "C11.1.1", name: "Camarote doble climatizado", dataType: "boolean", countries: "ALL", allowedSubcategories: "15, 16", isSearchFilter: true, searchWeight: 80 },
  { tagId: 460, tagGroupId: 78, code: "C11.1.14", name: "Aire acondicionado marino y planta generadora", dataType: "boolean", countries: "ALL", allowedSubcategories: "15, 16", isSearchFilter: true, searchWeight: 80 },
  { tagId: 462, tagGroupId: 78, code: "C11.1.16", name: "Desalinizadora / Potabilizadora de agua a bordo", dataType: "boolean", countries: "ALL", allowedSubcategories: "16", isSearchFilter: true, searchWeight: 70 },
  { tagId: 472, tagGroupId: 78, code: "C11.2.2", name: "Solárium acolchado en proa", dataType: "boolean", countries: "ALL", allowedSubcategories: "15, 16", isSearchFilter: true, searchWeight: 80 },
  { tagId: 473, tagGroupId: 78, code: "C11.2.3", name: "Plataforma de baño en popa con ducha dulce", dataType: "boolean", countries: "ALL", allowedSubcategories: "15, 16", isSearchFilter: true, searchWeight: 85 },
  { tagId: 484, tagGroupId: 78, code: "C11.4.1", name: "Servicio de Capitán / Patrón incluido", dataType: "boolean", countries: "ALL", allowedSubcategories: "16", isSearchFilter: true, searchWeight: 100 },
  { tagId: 486, tagGroupId: 78, code: "C11.4.3", name: "Marinería y Chef a bordo", dataType: "boolean", countries: "ALL", allowedSubcategories: "16", isSearchFilter: true, searchWeight: 70 },
  { tagId: 489, tagGroupId: 78, code: "C11.4.6", name: "Wi-Fi Satelital Starlink Marítimo en alta mar", dataType: "boolean", countries: "ALL", allowedSubcategories: "15, 16", isSearchFilter: true, searchWeight: 85 },
  { tagId: 491, tagGroupId: 78, code: "C11.4.8", name: "Equipo completo de Snorkel y Paddle Surf (SUP)", dataType: "boolean", countries: "ALL", allowedSubcategories: "16", isSearchFilter: true, searchWeight: 60 },
  { tagId: 497, tagGroupId: 78, code: "C11.5.1", name: "Chalecos salvavidas, Radio VHF y Radiobaliza EPIRB", dataType: "boolean", countries: "ALL", allowedSubcategories: "15, 16", isSearchFilter: false, searchWeight: 0 },
];

/**
 * Evalúa si una etiqueta aplica para un subcategory_id y código de país ("VE" | "ES")
 * Cumple la regla V15: "no poner etiquetas exclusivas de España / ES cuando se configura Venezuela"
 */
export function isTagAllowedForSubcategoryAndCountry(
  tag: MasterTagV15,
  subcategoryId: number,
  countryIso: CountryCodeV15 = "VE"
): boolean {
  if (tag.countries !== "ALL" && tag.countries !== countryIso) {
    return false;
  }

  const rule = tag.allowedSubcategories.trim().toUpperCase();
  if (rule === "ALL") return true;

  const segments = rule.split(",").map((s) => s.trim());
  for (const seg of segments) {
    if (seg.includes("-")) {
      const [startStr, endStr] = seg.split("-").map((n) => parseInt(n.trim(), 10));
      if (!isNaN(startStr) && !isNaN(endStr)) {
        if (subcategoryId >= startStr && subcategoryId <= endStr) {
          return true;
        }
      }
    } else {
      const exact = parseInt(seg, 10);
      if (!isNaN(exact) && exact === subcategoryId) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Devuelve la estructura dinámica de pasos del Wizard V15 (5 a 8 pasos)
 * según la categoría principal (CS-01..04) y subcategoría (SCS-01..16)
 */
export interface WizardStepDefinitionV15 {
  stepNumber: number;
  id: string;
  title: string;
  subtitle: string;
  tagGroupIds: number[];
  includesPoiBuilder?: boolean;
  includesPivotUnits?: boolean;
  includesRoomsDistributionJsonb?: boolean;
}

export function getWizardStepsForSubcategoryV15(
  serviceCategoryId: number,
  subcategoryId: number
): WizardStepDefinitionV15[] {
  const baseSteps: WizardStepDefinitionV15[] = [
    {
      stepNumber: 1,
      id: "paso-1-inicial",
      title: "Paso 1 · Configuración Inicial del Establecimiento",
      subtitle:
        "Información general (C00.1), capacidad, dirección postal segmentada por país (VE/ES), entorno y región turística.",
      tagGroupIds: [2, 3, 5, 7, 8, 9],
    },
    {
      stepNumber: 2,
      id: "paso-2-fiscales-contacto-poi",
      title: "Paso 2 · Datos Fiscales, Contacto, Certificaciones y Puntos de Interés",
      subtitle:
        "RIF / NIF y razón social (C00.2), contacto con HDV y clientes (C00.3), estrellas (C00.4), Sello Legal HDV (C00.5) y lugares cercanos (C00.6).",
      tagGroupIds: [10, 14, 15, 16, 17],
      includesPoiBuilder: true,
    },
    {
      stepNumber: 3,
      id: "paso-3-infraestructura",
      title: "Paso 3 · Propiedad: Equipamiento, Infraestructura y Energía 24/7",
      subtitle:
        "Bienestar y piscinas (C01.1), ocio (C01.2), eventos (C01.3) y Respaldo Crítico en Venezuela: Planta Eléctrica 24/7 (C01.4.1) y Tanque de Agua Continuo (C01.4.2).",
      tagGroupIds: [21, 22, 23, 24],
    },
    {
      stepNumber: 4,
      id: "paso-4-servicios-seguridad",
      title: "Paso 4 · Servicios, Experiencias, Accesibilidad y Seguridad",
      subtitle:
        "Recepción, gastronomía, Wi-Fi Starlink, parking (C02) y protocolos de accesibilidad PMR y vigilancia 24h (C03).",
      tagGroupIds: [26, 27, 28, 29, 30, 31, 32, 34, 35],
    },
    {
      stepNumber: 5,
      id: "paso-5-politicas-pagos",
      title: "Paso 5 · Políticas, Normas y Pasarela Financiera (VE / ES)",
      subtitle:
        "Horarios Check-In/Out, LOPNNA, mascotas, régimen de comidas y métodos de pago según país (VE: Pago Móvil, Zelle, Binance Pay, Panamá / ES: Bizum, TPV, Efectivo máx. 1.000 €).",
      tagGroupIds: [37, 38, 39, 40, 42, 44, 45, 46, 47, 48, 49],
    },
  ];

  // CS-01: Hoteles y Hospedajes con recepción
  if (serviceCategoryId === 1) {
    if (subcategoryId === 6) {
      // SOLO PARA SCS-06: LOVE HOTELS Y MOTELES
      baseSteps.push({
        stepNumber: 6,
        id: "paso-6-love-hotels",
        title: "Paso 6 · Propiedad: Instalaciones Específicas para Love Hotels y Moteles",
        subtitle:
          "Mobiliario especial, iluminación LED por escenas, garaje privado con auto-check-in, privacidad total (C08) y unidades JSONB (C05-C06).",
        tagGroupIds: [63, 50, 53, 54, 55, 59, 61],
        includesRoomsDistributionJsonb: true,
      });
    } else {
      // Distribución y equipamiento de habitaciones/suites para hoteles y posadas
      baseSteps.push({
        stepNumber: 6,
        id: "paso-6-unidades-hotel",
        title: "Paso 6 · Distribución y Equipamiento de Habitaciones / Suites (JSONB)",
        subtitle:
          "Configuración de tipologías de habitaciones en `rooms_distribution` (JSONB), camas King/Queen, aire acondicionado, lencería y amenidades (C05 y C06).",
        tagGroupIds: [50, 53, 54, 55, 56, 57, 59, 61],
        includesRoomsDistributionJsonb: true,
      });
    }
    return baseSteps;
  }

  // CS-02: Resorts, Campings y complejos
  if (serviceCategoryId === 2) {
    baseSteps.push({
      stepNumber: 6,
      id: "paso-6-agrupacion-unidades",
      title: "Paso 6 · Instalaciones de Complejo y Unidades Habitacionales (Tabla Pivote + JSONB)",
      subtitle:
        "Servicios de complejo vacacional (C07), selección de unidades hijas (Bungalows, Cabañas, Glamping, Suites) y distribución JSONB `rooms_distribution` (C05-C06).",
      tagGroupIds: [62, 50, 53, 54, 55, 57, 59, 61],
      includesPivotUnits: true,
      includesRoomsDistributionJsonb: true,
    });
    return baseSteps;
  }

  // CS-03: Inmuebles y viviendas vacacionales
  if (serviceCategoryId === 3) {
    baseSteps.push(
      {
        stepNumber: 6,
        id: "paso-6-distribucion-casa",
        title: "Paso 6 · Distribución de la Unidad de Alojamiento (JSONB)",
        subtitle:
          "Dormitorios, baños privados, cocina equipada, metraje y distribución de camas en `rooms_distribution` (C05).",
        tagGroupIds: [50],
        includesRoomsDistributionJsonb: true,
      },
      {
        stepNumber: 7,
        id: "paso-7-equipamiento-casa",
        title: "Paso 7 · Equipamiento e Infraestructura de la Unidad",
        subtitle:
          "Confort interior, climatización, Smart TV, exteriores privados, terraza y menaje de cocina (C06).",
        tagGroupIds: [53, 54, 55, 56, 57, 59, 61],
      }
    );
    if (subcategoryId === 12) {
      baseSteps.push({
        stepNumber: 8,
        id: "paso-8-casas-montana",
        title: "Paso 8 · Instalaciones Específicas para Casas y Chalets de Montaña",
        subtitle:
          "Chimenea de leña, confort térmico de páramo/montaña, jacuzzi exterior climatizado y gastronomía andina (C09).",
        tagGroupIds: [68],
      });
    }
    return baseSteps;
  }

  // CS-04: Alojamiento en Embarcaciones y Servicios Náuticos
  if (serviceCategoryId === 4) {
    baseSteps.push(
      {
        stepNumber: 6,
        id: "paso-6-distribucion-barco",
        title: "Paso 6 · Distribución de Camarotes y Cubierta (JSONB)",
        subtitle:
          "Capacidad de pasajeros, número de camarotes, baños marinos y áreas sociales a bordo en `rooms_distribution` (C05).",
        tagGroupIds: [50],
        includesRoomsDistributionJsonb: true,
      },
      {
        stepNumber: 7,
        id: "paso-7-equipamiento-barco",
        title: "Paso 7 · Equipamiento Interior de Camarotes",
        subtitle:
          "Climatización marina, lencería náutica, sonido Bluetooth multizona y cocina a bordo (C06).",
        tagGroupIds: [53, 54, 55, 59, 61],
      },
      {
        stepNumber: 8,
        id: "paso-8-embarcaciones",
        title: "Paso 8 · Prestaciones Náuticas, Tripulación y Seguridad Marítima",
        subtitle:
          "Puerto y amarre estático (C10 para SCS-15) o Capitán, marinería, Starlink en alta mar, desalinizadora y snorkel/SUP (C11 para SCS-15 y SCS-16).",
        tagGroupIds: [77, 78],
      }
    );
    return baseSteps;
  }

  return baseSteps;
}

export interface PropertyWizardV15State {
  countryIso?: CountryCodeV15;
  countryCategoryId?: number;
  selectedCategoryId?: number;
  selectedSubcategoryId?: number;
  currentStepIdx?: number;
  tagValues?: Record<string, any>;
  roomsDistribution?: RoomDistributionUnitJsonbV15[];
  selectedPivotUnitIds?: number[];
  poiList?: any[];
  checkInFrom?: string;
  checkInUntil?: string;
  checkOutFrom?: string;
  checkOutUntil?: string;
  minimumCheckInAge?: number;
  customLegalNotices?: string | string[];
  updatedAt?: string;
}

/**
 * FILTRO DE PURGA ESTRICTA:
 * Elimina de cualquier texto, cláusula o política heredada cualquier mención a:
 * 1) "Cadivi" / "CENCOEX" (anacronismo extinto)
 * 2) Cláusulas genéricas de "COVID-19" / "coronavirus" / "mascarilla obligatoria"
 */
export function sanitizeVenezuelaLegalNotices(
  rawNotices: string | string[]
): string[] {
  const bannedPatterns = [
    /cadivi/i,
    /cencoex/i,
    /coronavirus/i,
    /covid-19/i,
    /covid19/i,
    /llevar mascarilla/i,
    /uso obligatorio de mascarilla/i,
  ];

  const list = Array.isArray(rawNotices)
    ? rawNotices
    : String(rawNotices || "")
        .split(/\n+/)
        .filter(Boolean);

  return list
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false;
      return !bannedPatterns.some((pattern) => pattern.test(line));
    });
}

/**
 * Textos legales e informativos por defecto para Venezuela ("A tener en cuenta")
 * 100% depurados y adaptados al marco jurídico y operativo vigente en Venezuela
 */
export const DEFAULT_VENEZUELA_LEGAL_NOTICES: string[] = [
  "Las tarifas están expresadas en Dólares Estadounidenses ($ USD) y pueden pagarse en divisas (Zelle, Efectivo USD, Binance Pay USDT, Transferencia Panamá) o en Bolívares (VES) mediante Pago Móvil o Punto de Venta a la tasa oficial vigente del Banco Central de Venezuela (BCV).",
  "Al momento del Check-In, todos los huéspedes mayores de edad deberán presentar su Cédula de Identidad laminada o Pasaporte vigente (Etiqueta C04.1.9).",
  "En cumplimiento de la Ley Orgánica para la Protección de Niños, Niñas y Adolescentes (LOPNNA) en Venezuela, los menores de 18 años únicamente podrán alojarse acompañados por sus padres (presentando Partida de Nacimiento) o con Autorización de Viaje vigente emitida por el Consejo de Protección o Notaría Pública (Etiqueta C04.1.10).",
  "Informa al alojamiento con antelación tu hora estimada de llegada a través del botón de WhatsApp Directo para coordinar tu recepción sin esperas ni cargos de intermediación.",
  "Este establecimiento cuenta con verificación operativa en Hoteles de Venezuela LLC y garantiza trato directo 0% comisiones con el propietario.",
];

/**
 * Formateador nativo de Dualidad Monetaria (USD + Bs. VES)
 */
export const DEFAULT_BCV_EXCHANGE_RATE = 46.5;

export function formatDualCurrencyVenezuela(
  amountUsd: number,
  bcvRate: number = DEFAULT_BCV_EXCHANGE_RATE
): {
  usdFormatted: string;
  vesFormatted: string;
  combinedLabel: string;
} {
  const safeUsd = Number.isFinite(amountUsd) && amountUsd > 0 ? amountUsd : 0;
  const vesAmount = safeUsd * bcvRate;

  const usdFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(safeUsd);

  const vesFormatted = `Bs. ${new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(vesAmount)}`;

  return {
    usdFormatted,
    vesFormatted,
    combinedLabel: `${usdFormatted} (${vesFormatted})`,
  };
}

