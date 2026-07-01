export interface NationalPark {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  long_description: string;
  image_url: string;
  destination_name: string;
  icon_type: "mountain" | "tree" | "waves" | "bird" | "palm";
  highlights: string;
  latitude: string;
  longitude: string;
  area: string;
  climate: string;
  how_to_get_there: string;
  best_time_to_visit: string;
  gallery_images?: string;
  is_featured: boolean;
}

export const NATIONAL_PARKS_MOCK: NationalPark[] = [
  {
    id: 1,
    name: "Parque Nacional Canaima",
    slug: "parque-nacional-canaima",
    short_description: "Hogar del Salto Ángel, la caída de agua más alta del mundo, y de los milenarios tepuyes.",
    long_description: "El Parque Nacional Canaima es una joya ecológica ubicada en el estado Bolívar. Declarado Patrimonio de la Humanidad por la UNESCO, se extiende sobre más de 30,000 kilómetros cuadrados hasta la frontera con Guyana y Brasil. Destaca por sus majestuosas mesetas de roca llamadas tepuyes, de millones de años de antigüedad, y por albergar el Salto Ángel (Kerepakupai Vená), con una caída libre de 979 metros. Sus ríos de aguas rojizas y arenas finas forman lagunas y saltos de agua espectaculares.",
    image_url: "https://images.unsplash.com/photo-1586375300773-8384e3e4916f?w=800&auto=format&fit=crop",
    destination_name: "Canaima",
    icon_type: "bird",
    highlights: "Salto Ángel, Tepuy Roraima, Laguna de Canaima, Quebrada de Jaspe",
    latitude: "6.2442",
    longitude: "-62.8544",
    area: "30,000 km²",
    climate: "Cálido húmedo con lluvias constantes",
    how_to_get_there: "Vía aérea en vuelos comerciales o charters desde Caracas, Ciudad Bolívar o Puerto Ordaz.",
    best_time_to_visit: "De junio a diciembre para ver el Salto Ángel en su máximo caudal; de enero a mayo para caminatas y excursiones más secas.",
    is_featured: true
  },
  {
    id: 2,
    name: "Parque Nacional Archipiélago Los Roques",
    slug: "parque-nacional-los-roques",
    short_description: "El atolón coralino más grande de las Antillas, con cayos de arena blanca y aguas turquesas cristalinas.",
    long_description: "Los Roques es un archipiélago de Venezuela ubicado en el Mar Caribe, a unos 168 km al norte de La Guaira. Debido a su inmensa belleza ecológica y biodiversidad marina, fue declarado Parque Nacional en 1972. El archipiélago consta de unas 50 islas diferentes y más de 300 cayos y bancos de arena que rodean una laguna central de aguas calmadas. Es un paraíso de renombre mundial para el buceo, el snorkel, el windsurf y la pesca deportiva debido a sus arrecifes de coral perfectamente preservados.",
    image_url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop",
    destination_name: "Los Roques",
    icon_type: "palm",
    highlights: "Cayo de Agua, Gran Roque, Madrisquí, Francisquí, Bajo de Cote",
    latitude: "11.8549",
    longitude: "-66.7593",
    area: "2,211 km² (marina y terrestre)",
    climate: "Cálido, seco y soleado todo el año (28°C promedio)",
    how_to_get_there: "Vuelos de 35 minutos en avioneta desde el Aeropuerto de Maiquetía (Caracas) o Higuerote.",
    best_time_to_visit: "Todo el año. Los meses con vientos más calmados son de agosto a noviembre, ideales para buceo.",
    is_featured: true
  },
  {
    id: 3,
    name: "Parque Nacional Morrocoy",
    slug: "parque-nacional-morrocoy",
    short_description: "Cayos espectaculares de aguas cálidas, canales de manglares y una abundante avifauna marina.",
    long_description: "Ubicado en el estado Falcón, Morrocoy abarca una zona costera e insular llena de cayos (islas de arena coralina), ensenadas y bahías bordeadas por densos manglares. Cayo Sombrero, Cayo Muerto y Cayo Sal son algunos de los destinos predilectos para pasar el día. Sus aguas poco profundas, transparentes y cálidas son ideales para familias y entusiastas de los deportes acuáticos. Además, el parque alberga el Refugio de Fauna Silvestre Cuare, donde miles de flamencos y aves migratorias anidan anualmente.",
    image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop",
    destination_name: "Morrocoy",
    icon_type: "waves",
    highlights: "Cayo Sombrero, Playuela, Cayo Varadero, Bajo Caimán, Santuario de Aves",
    latitude: "10.8667",
    longitude: "-68.2333",
    area: "320 km²",
    climate: "Cálido tropical, con temperaturas de 27°C a 32°C",
    how_to_get_there: "Por carretera desde Caracas (unas 3.5 a 4 horas) hasta las poblaciones de Tucacas o Chichiriviche, donde se abordan lanchas.",
    best_time_to_visit: "Cualquier época del año. Se recomienda evitar los fines de semana festivos si se prefiere mayor tranquilidad.",
    is_featured: true
  },
  {
    id: 4,
    name: "Parque Nacional El Ávila / Waraira Repano",
    slug: "parque-nacional-el-avila",
    short_description: "El imponente pulmón vegetal que corona a Caracas, ideal para senderismo, naturaleza y vistas panorámicas.",
    long_description: "El Parque Nacional El Ávila (oficialmente Waraira Repano) es una cadena montañosa de la Cordillera de la Costa que separa a la ciudad de Caracas del Mar Caribe. Con alturas que van desde los 120 metros hasta los 2,765 metros en el Pico Naiguatá, ofrece una variedad de microclimas que albergan bosques nublados de gran biodiversidad. Es el destino predilecto de los caraqueños para hacer caminatas (como Sabas Nieves), respirar aire puro y disfrutar del Teleférico que sube hasta el Hotel Humboldt en la cima.",
    image_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop",
    destination_name: "Caracas",
    icon_type: "tree",
    highlights: "Pico Humboldt, Galipán, Sabas Nieves, Pico Naiguatá, Teleférico",
    latitude: "10.5167",
    longitude: "-66.8500",
    area: "851 km²",
    climate: "Templado de montaña en las alturas, fresco y agradable",
    how_to_get_there: "Acceso peatonal por múltiples senderos en el norte de Caracas, en vehículo rústico vía Galipán, o en Teleférico desde Maripérez.",
    best_time_to_visit: "De diciembre a abril, cuando el clima es más despejado y fresco, ideal para senderismo.",
    is_featured: false
  },
  {
    id: 5,
    name: "Parque Nacional Sierra Nevada",
    slug: "parque-nacional-sierra-nevada",
    short_description: "Cumbres andinas perpetuamente nevadas, lagunas glaciares y el teleférico más alto del mundo.",
    long_description: "Situado en el corazón de los Andes venezolanos, entre los estados Mérida y Barinas, este parque resguarda las cumbres más altas del país, incluyendo el Pico Bolívar (4,978 msnm), el Pico Humboldt y el Pico Bompland. Su relieve glaciar alberga lagunas de montaña de gran belleza y vegetación de páramo como los frailejones. El parque cuenta con el Sistema Teleférico Mukumbarí, que conecta la ciudad de Mérida con el Pico Espejo a 4,765 metros, ofreciendo un viaje inolvidable por la geografía andina.",
    image_url: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&auto=format&fit=crop",
    destination_name: "Mérida",
    icon_type: "mountain",
    highlights: "Pico Bolívar, Laguna de Mucubají, Teleférico Mukumbarí, Pico Espejo",
    latitude: "8.5444",
    longitude: "-71.0425",
    area: "2,764 km²",
    climate: "De frío de montaña a gélido de alta montaña (nieve en cumbres)",
    how_to_get_there: "Por vía terrestre hasta Mérida, y desde allí a través del teleférico o contratando excursiones de montañismo.",
    best_time_to_visit: "Diciembre a marzo para cielos despejados; de julio a septiembre para tener mayor probabilidad de nevadas en las cumbres.",
    is_featured: false
  },
  {
    id: 6,
    name: "Parque Nacional Mochima",
    slug: "parque-nacional-mochima",
    short_description: "Bahías profundas, islas semidesérticas de aguas calmas y avistamiento constante de delfines.",
    long_description: "Mochima se extiende a lo largo de la costa caribeña del este de Venezuela, entre las ciudades de Barcelona, Puerto La Cruz y Cumaná. Es un espectacular paisaje marino de bahías protegidas, acantilados de roca rojiza que caen directamente al mar turquesa, y decenas de islas desiertas. Playa Colorada, Playa El Faro y las islas de Arapo son muy populares. Sus aguas tranquilas y profundas son ideales para paseos en bote, snorkel y avistamientos diarios de manadas de delfines que juegan junto a las embarcaciones.",
    image_url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop",
    destination_name: "Puerto La Cruz",
    icon_type: "waves",
    highlights: "Playa Colorada, Isla de Plata, Playa El Faro, Avistamiento de Delfines",
    latitude: "10.2458",
    longitude: "-64.3833",
    area: "949 km²",
    climate: "Cálido tropical, seco y soleado (27°C promedio)",
    how_to_get_there: "Vía terrestre desde Barcelona o Cumaná. Se toman botes peñeros desde el Paseo Colón de Puerto La Cruz o muelles de Mochima.",
    best_time_to_visit: "Todo el año. Los meses de enero a mayo suelen ser los más frescos y recomendados.",
    is_featured: false
  }
];
