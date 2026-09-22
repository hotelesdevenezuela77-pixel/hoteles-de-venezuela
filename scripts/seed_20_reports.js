import pg from 'pg';
import dns from 'dns/promises';

const { Client } = pg;

const password = '+Q5Wpz.TXK6@w_2';
const projectRef = 'ghgetcznlrilgocwigmj';
const user = `postgres.${projectRef}`;
const database = 'postgres';
const host = 'aws-1-us-west-2.pooler.supabase.com';

const reports = [
  {
    title: "Parque Nacional Morrocoy: Guía de Cayos, Navegación Serena y Posadas Exclusivas",
    slug: "parque-nacional-morrocoy-cayos-tucacas-posadas",
    excerpt: "Descubre el Parque Nacional Morrocoy: guía de navegación serena por cayos cristalinos, posadas con planta eléctrica y reserva directa sin intermediarios.",
    reading_time: 8,
    author_name: "Equipo Editorial Hoteles de Venezuela",
    status: "published",
    featured_image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    content: `# Parque Nacional Morrocoy: Guía de Cayos, Navegación Serena y Posadas Exclusivas en Tucacas y Chichiriviche

> **LO QUE DEBES SABER ANTES DE NAVEGAR:**
> - **Acceso principal:** Tucacas (embarcaderos como La Marina o Las Luisas) y Chichiriviche (Playa Norte y Playa Sur).
> - **Regulación acústica INPARQUES:** Está prohibido el uso de equipos de sonido de alta potencia en los cayos para proteger los ecosistemas de flamencos, manglares y fauna marina.
> - **Cayos imperdibles:** Cayo Sombrero (palmeras y aguas turquesas), Playuela/Playuelita (arrecife coralino ideal para snorkel), Cayo Muerto (el más cercano a Chichiriviche) y Los Juanes (piscina natural de bajo calado).
> - **Reserva directa sin comisiones:** Alojarte en posadas con planta eléctrica total, planta desalinizadora y muelle privado reservando directamente en Hoteles de Venezuela te ahorra hasta un 25% frente a agencias intermediarias.

---

El Parque Nacional Morrocoy no necesita filtros de Instagram. Sus 32.000 hectáreas de manglares, canales y cayos coralinos en la costa oriental de Falcón representan el paraíso caribeño por excelencia de Venezuela. 

Tras las recientes normativas ambientales que protegen la tranquilidad y la acústica natural del parque, Morrocoy ha recuperado su magia original: el suave oleaje caribeño, el canto de las aves marinas y la contemplación de arrecifes vivos.

---

## 1. Los Cayos Más Destacados de Morrocoy

### Cayo Sombrero: La Joya de la Corona
El cayo más fotografiado y con mayor extensión de sombra natural gracias a sus frondosos cocoteros. Cuenta con dos playas de aguas calmas y un bosque interior donde relajarse. Ideal para pasar el día completo con servicio de marisquería fresca servida directamente en la arena.

### Playuela y Playuelita: Snorkel y Tranquilidad
Separadas por una franja de manglares, estas dos playas ofrecen aguas transparentes protegidas del viento y una barrera coralina accesible nadando desde la orilla.

### Los Juanes: La Piscina Natural Marina
Una bahía sin playa de arena firme donde el agua llega a la cintura y el fondo es de arena blanca pura. Los botes y peñeros fondean con respeto al entorno para disfrutar de ostras frescas, ceviches y camarones servidos por vendedores artesanales en botes flotantes.

### Cayo Sal y Cayo Muerto: La Ruta Rápida desde Chichiriviche
Accesibles en solo 5 a 10 minutos de navegación desde los muelles de Chichiriviche, son perfectos para familias con niños pequeños por su oleaje casi nulo y facilidades de toldos.

---

## 2. Consejos de Campo y Logística Anti-Sobreprecios

1. **Tarifas de Peñeros Oficiales:** Los precios de los traslados a los cayos están fijados por las asociaciones de lancheros en las taquillas oficiales de los muelles (Tucacas y Chichiriviche). Compra siempre tu boleto ida y vuelta en taquilla oficial y acuerda la hora exacta de retorno (habitualmente entre 4:00 PM y 5:00 PM).
2. **Hospedaje con Servicios Blindados:** Verifica que tu posada u hotel cuente con planta eléctrica de capacidad 100% (aire acondicionado garantizado) y pozo o tanque de agua de gran autonomía.
3. **Consumo en Playa:** Pregunta siempre el precio de los platos de pescado frito y mariscos antes de ordenar para evitar sorpresas al momento de la cuenta.

---

## ¿Por Qué Reservar Directamente con Posadas en Morrocoy?

Al gestionar tu estadía directamente con los anfitriones y propietarios a través de **Hoteles de Venezuela**:
- Obtienes la tarifa real del posadero sin los recargos del 15% al 30% que cobran plataformas extranjeras.
- Coordinas traslados marítimos privados o salidas en lancha deportiva directamente desde el muelle de tu hospedaje.
- Recibes recomendaciones locales de primera mano para visitar los cayos más solitarios en días laborables.`
  },
  {
    title: "Canaima y Salto Ángel: Guía Maestra de Expedición, Navegación Fluvial y Campamentos",
    slug: "canaima-salto-angel-campamentos-excursion-churun",
    excerpt: "Guía definitiva para viajar a Canaima y el Salto Ángel: vuelos chárter, navegación por el río Churún, campamentos pemones y reserva directa sin comisiones.",
    reading_time: 10,
    author_name: "Equipo Editorial Hoteles de Venezuela",
    status: "published",
    featured_image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    content: `# Canaima y Salto Ángel: Guía Maestra de Expedición, Navegación Fluvial y Campamentos

> **CLAVES DE EXPEDICIÓN AL SALTO ÁNGEL:**
> - **Acceso exclusivo:** Solo por vía aérea desde Maiquetía (Caracas) o Puerto Ordaz hacia el Aeropuerto de Canaima (CAJ).
> - **Navegación al Kerepakupai Merú:** Temporada de lluvias y aguas intermedias (junio a diciembre) para remontar los ríos Carrao y Churún en curiara motorizada.
> - **Equipaje en vuelos:** Límite estricto de 10 kg a 15 kg por persona en maleta suave (duffel bag).
> - **Reserva directa:** Reserva tu lodge o campamento ecoturístico directamente para acceder a excursiones organizadas con guías indígenas pemones certificados.

---

El Salto Ángel (*Kerepakupai Merú* en lengua pemón), con sus 979 metros de caída ininterrumpida desde la meseta del Auyantepuy, es una de las grandes maravillas geológicas del planeta. El Parque Nacional Canaima ofrece un paisaje ancestral que inspiró obras literarias y cinematográficas universales.

---

## 1. La Travesía Fluvial hacia la Base del Salto Ángel

La expedición clásica de 1 noche / 2 días hacia la base del Salto Ángel inicia en el Puerto Ucaima de la Laguna de Canaima:
1. **Navegación por el Río Carrao:** Cruce de los rápidos de Mayupa en curiara indígena de madera con motor fuera de borda.
2. **Cañón del Diablo y Río Churún:** Entrada al imponente cañón donde las paredes verticales del Auyantepuy se elevan más de un kilómetro sobre el cauce.
3. **Caminata por la Selva Húmeda:** Sendero de 1 hora entre raíces milenarias y rocas húmedas hasta el Mirador Laime, justo al pie de la cascada más alta del mundo.
4. **Noche en Hamacas frente al Salto:** Pernocta en campamentos rústicos con mosquitero escuchando el rugido del agua.

---

## 2. Excursiones Imperdibles en la Laguna de Canaima

- **Salto El Sapo y El Hacha:** Cruce emocionante por detrás de la cortina de agua con chaleco salvavidas.
- **Sobrevuelo al Auyantepuy:** Vuelos panorámicos en avioneta Cessna para contemplar la inmensidad del tepuy desde el aire.
- **Comunidades Pemón de Kamarata y Kavak:** Exploración de cañones y cuevas sagradas.

---

## Logística y Consejos de Campo

- Lleva bolsas impermeables (dry bags) para proteger cámaras, pasaportes y teléfonos durante la navegación en curiara.
- Utiliza calzado de trekking con buen agarre para superficies mojadas y repelente de insectos libre de químicos nocivos para el agua.
- Paga la tasa de entrada al Parque Nacional INPARQUES en el aeropuerto al aterrizar (lleva efectivo en dólares o bolívares).`
  },
  {
    title: "Archipiélago Los Roques: Guía de Vuelos, Cayos Vírgenes y Posadas de Lujo Descalzo",
    slug: "los-roques-posadas-cayos-vuelos-guia",
    excerpt: "Planifica tu viaje a Los Roques: franquicia de equipaje, cayos cercanos y lejanos, gastronomía del mar y las mejores posadas boutique con reserva directa.",
    reading_time: 9,
    author_name: "Equipo Editorial Hoteles de Venezuela",
    status: "published",
    featured_image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    content: `# Archipiélago Los Roques: Guía de Vuelos, Cayos Vírgenes y Posadas de Lujo Descalzo

> **DATOS ESENCIALES PARA TU VIAJE A LOS ROQUES:**
> - **Vuelos desde Maiquetía:** 35 a 45 minutos de vuelo en aeronaves de corto alcance hacia Gran Roque (LRV).
> - **Franquicia de equipaje:** 10 kg a 15 kg por pasajero en bodega + 5 kg de mano (el exceso se cobra por kilo).
> - **Cayos cercanos:** Madrisquí, Francisquí y Cayo Pirata (a 10-15 minutos en lancha).
> - **Cayos lejanos:** Cayo de Agua, Crasquí, Carenero y Dos Mosquises (a 40-50 minutos).
> - **Reserva directa:** Reserva en posadas VIP con pensión completa (desayuno, cava para la playa y cena gourmet de 3 pasos) sin recargos intermediarios.

---

Los Roques es el atolón coralino más espectacular del Mar Caribe. Con más de 300 islas y bancos de arena protegidos, ofrece un concepto exclusivo de "lujo descalzo": calles de arena fina sin vehículos a motor, posadas de arquitectura caribeña refinada y aguas de hasta siete tonalidades de azul y turquesa.

---

## 1. Cayos Imperdibles en Los Roques

### Cayo de Agua
Famoso por su icónico istmo o lengua de arena blanca que separa dos mares de aguas transparentes. El paisaje más fotografiado del archipiélago.

### Francisquí y la Piscina Natural
Perfecto para los aficionados al snorkel por su piscina natural de aguas cristalinas poblada de peces loro, mantarrayas y tortugas marinas.

### Crasquí
Una playa extensa de arena suave con restaurantes de pescadores locales donde degustar langosta fresca en temporada (noviembre a abril).

---

## 2. Gastronomía y Experiencia en Posadas

Las posadas de Gran Roque se distinguen por su propuesta culinaria mediterránea-caribeña. Al despertar, disfrutas de un desayuno con frutas frescas y café de especialidad. La posada te prepara una **cava térmica** equipada con almuerzo gourmet, bebidas frías, sombrilla y sillas de playa para llevar al cayo del día. Al regresar al atardecer, te espera una cena de tres pasos con pesca del día recién capturada.`
  },
  {
    title: "Páramo de Mérida y Teleférico Mukumbarí: Guía de Altura, Rutas Andinas y Posadas con Chimenea",
    slug: "paramo-merida-teleferico-mukumbari-posadas-sierra-nevada",
    excerpt: "Descubre el Páramo de Mérida: estaciones del Teleférico Mukumbarí, Laguna de Mucubají, senderismo en la Sierra Nevada y posadas andinas con chimenea.",
    reading_time: 8,
    author_name: "Equipo Editorial Hoteles de Venezuela",
    status: "published",
    featured_image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    content: `# Páramo de Mérida y Teleférico Mukumbarí: Guía de Altura, Rutas Andinas y Posadas con Chimenea

> **DATOS CLAVE DEL VIAJE A MÉRIDA:**
> - **Vuelos comerciales:** Aeropuerto Juan Pablo Pérez Alfonzo de El Vigía (VIG) o Aeropuerto Alberto Carnevalli en la ciudad de Mérida (MRD).
> - **Teleférico Mukumbarí:** El teleférico más alto y segundo más largo del mundo, ascendiendo desde Barinitas (1.577 msnm) hasta Pico Espejo (4.765 msnm).
> - **Clima:** Temperaturas que oscilan entre 18°C en el valle hasta 0°C o bajo cero en las cumbres y el Páramo de Mifafí.
> - **Reserva directa:** Posadas rústicas y chalets con chimenea de leña, agua caliente continua y chocolate caliente andino.

---

Mérida es el corazón de los Andes venezolanos. La cordillera ofrece cumbres nevadas, bosques de frailejones centenarios, valles agrícolas fértiles y una calidez humana incomparable.

---

## 1. El Teleférico Mukumbarí: De la Selva Nublada al Pico Espejo

El sistema consta de 4 tramos y 5 estaciones:
1. **Barinitas (1.577 msnm):** Estación base en el centro de Mérida.
2. **La Montaña (2.436 msnm):** Mirador hacia la meseta de la ciudad.
3. **La Aguada (3.452 msnm):** Inicio de la vegetación de páramo y avistamiento de frailejones.
4. **Loma Redonda (4.045 msnm):** Punto de partida para cabalgatas y senderismo hacia el pueblo andino de Los Nevados.
5. **Pico Espejo (4.765 msnm):** Mirador cumbre frente a la estatua de la Virgen de las Nieves y el Pico Bolívar (4.978 msnm).

---

## 2. La Ruta del Páramo: De Mucubají a Mifafí

- **Laguna de Mucubají y Laguna Negra:** Espejos de agua glaciares rodeados de frailejones y truchicultura andina.
- **Monumento a la Loca Luz Caraballo en Apartaderos:** Leyenda poética andina de Andrés Eloy Blanco.
- **Capilla de Piedra de Juan Félix Sánchez en San Rafael de Mucuchíes:** Obra maestra de la arquitectura popular en piedra tallada a mano.`
  },
  {
    title: "Trekking al Monte Roraima: Guía Completa de la Expedición a la Tierra de Tepuyes",
    slug: "trekking-monte-roraima-gran-sabana-guia-excursion",
    excerpt: "Guía para la expedición al Monte Roraima en la Gran Sabana: itinerario de 6 días, porteadores pemones, equipo técnico y posadas en Santa Elena de Uairén.",
    reading_time: 11,
    author_name: "Equipo Editorial Hoteles de Venezuela",
    status: "published",
    featured_image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
    content: `# Trekking al Monte Roraima: Guía Completa de la Expedición a la Tierra de Tepuyes

> **RESUMEN DE LA EXPEDICIÓN AL RORAIMA:**
> - **Duración clásica:** 6 días / 5 noches (o 7-8 días para exploraciones profundas en la cumbre).
> - **Punto de partida:** Comunidad indígena de Paraitepuy de Roraima (acceso en vehículo 4x4 desde Santa Elena de Uairén).
> - **Dificultad física:** Alta / Exigente. Requiere buena condición cardiovascular y botas de montaña de caña media con soporte impermeable.
> - **Alojamiento:** Carpas en campamentos designados (Río Tek, Río Kukenán, Campamento Base y "Hoteles" en la cumbre bajo salientes de roca).

---

El Monte Roraima (2.810 msnm), el punto más alto de la formación tepuyana que comparten Venezuela, Brasil y Guyana, es uno de los paisajes geológicos más antiguos de la Tierra (con más de 2.000 millones de años).

---

## 1. Itinerario Paso a Paso de la Travesía

- **Día 1: Paraitepuy al Campamento Río Tek / Kukenán:** 12 km de caminata por sabana abierta con vistas monumentales del Roraima y el Kukenán.
- **Día 2: Río Kukenán al Campamento Base:** Ascenso gradual entre colinas de arcilla hasta la falda del tepuy (1.870 msnm).
- **Día 3: El Ascenso por la Rampa:** El día más técnico. Subida por la pared de la selva nublada vertical hasta alcanzar la cumbre rocosa.
- **Día 4: Exploración de la Cumbre:** Visita al Valle de los Cristales, el Punto Triple (hito fronterizo Venezuela-Brasil-Guyana), La Ventana del Kukenán y las piscinas naturales llamadas *Jacuzzis*.
- **Días 5 y 6: Descenso y Retorno:** Bajada de la pared hacia Río Tek y retorno final a Paraitepuy para celebrar con un almuerzo pemón.`
  },
  {
    title: "Colonia Tovar y El Picacho: Bosque Nublado, Tradición Alemana y Cabañas de Altura",
    slug: "colonia-tovar-posadas-el-picacho-cabanas-turismo",
    excerpt: "Guía turística de la Colonia Tovar: microcervecerías artesanales, fresas con crema, senderismo al Picacho y cabañas alpinas con chimenea sin comisiones.",
    reading_time: 7,
    author_name: "Equipo Editorial Hoteles de Venezuela",
    status: "published",
    featured_image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    content: `# Colonia Tovar y El Picacho: Bosque Nublado, Tradición Alemana y Cabañas de Altura

> **CLAVES DE TU ESCAPADA A LA COLONIA TOVAR:**
> - **Rutas de acceso:** Por El Junquito desde Caracas (vía panorámica de montaña) o por La Victoria desde el estado Aragua (subida pavimentada de pendientes pronunciadas).
> - **Clima:** Templado de montaña (10°C a 20°C), con densas neblinas que bajan al caer la tarde.
> - **Gastronomía:** Salchichas alemanas artesanales, rodilla de cerdo (*Eisbein*), fresas con crema, strudel de manzana y cervezas artesanales locales.
> - **Aventura y naturaleza:** Subida en 4x4 o trekking al Monumento Natural El Picacho y vuelo en parapente sobre el valle.

---

Fundada en 1843 por colonos provenientes de la Selva Negra de Alemania, la Colonia Tovar conserva su pintoresca arquitectura de entramado de madera (*Fachwerk*), techos a dos aguas y jardines de hortensias multicolores en plena Cordillera de la Costa.

---

## 1. Qué Ver y Hacer en la Colonia Tovar

- **Casco Histórico e Iglesia de San Martín de Tours:** Templo patrimonial de madera y museo de historia local.
- **Ruta de la Cerveza Artesanal:** Visita a microcervecerías pioneras de cerveza rubia, negra y de sabores frutales elaboradas con agua pura de manantial de montaña.
- **Trekking a El Picacho de la Colonia Tovar:** Mirador a más de 2.200 msnm con vistas espectaculares hacia el Mar Caribe por el norte y los valles de Aragua por el sur.`
  },
  {
    title: "Galipán y Parque Nacional Warairarepano: Gastronomía de Altura y Vistas al Caribe",
    slug: "galipan-warairarepano-avila-gastronomia-posadas",
    excerpt: "Descubre Galipán en el Cerro El Ávila: traslados en 4x4, flores, gastronomía de autor frente al mar y posadas románticas con reserva directa.",
    reading_time: 7,
    author_name: "Equipo Editorial Hoteles de Venezuela",
    status: "published",
    featured_image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
    content: `# Galipán y Parque Nacional Warairarepano: Gastronomía de Altura y Vistas al Caribe

> **DATOS CLAVE PARA SUBIR A GALIPÁN:**
> - **Acceso en vehículos 4x4:** Desde Cotiza (Caracas) por la vertiente sur o desde Macuto / San José de Galipán (La Guaira) por la vertiente norte.
> - **Miradores duales:** En días despejados puedes contemplar el valle de Caracas hacia el sur y la inmensidad del Mar Caribe hacia el norte.
> - **Gastronomía:** Restaurantes de alta cocina francesa, mediterránea y criolla de autor, chocolaterías artesanales y venta de flores exóticas.
> - **Pernocta romántica:** Posadas boutique exclusivas con chimeneas, jacuzzis con vistas al mar y cenas a la luz de las velas.

---

El poblado agrícola y gastronómico de San José de Galipán, anclado en la ladera norte del Parque Nacional Warairarepano a 1.800 metros de altitud, es el refugio favorito para una escapada romántica o un almuerzo de alta gama a minutos de la capital.

---

## 1. Experiencias Destacadas en Galipán

- **La Ruta de los Chocolates y Dulces Típicos:** Degustación de bombones rellenos con licor de flores y mermeladas de mora fresca cultivada en los huertos locales.
- **Museo de las Piedras Marinas Soñadoras:** Jardín escultórico único creado con rocas marinas redondeadas en San José de Galipán.
- **Paseo hacia el Teleférico de Caracas:** Conexión peatonal o en rústico hacia el Hotel Humboldt y la estación Warairarepano.`
  },
  {
    title: "Cueva del Guácharo y Caripe: El Misterio Subterráneo y el Aroma a Café de Monagas",
    slug: "cueva-del-guacharo-caripe-monagas-posadas-guacharos",
    excerpt: "Guía de viaje a la Cueva del Guácharo y Caripe: salida vespertina de los guácharos, haciendas cafetaleras y posadas coloniales en el oriente venezolano.",
    reading_time: 8,
    author_name: "Equipo Editorial Hoteles de Venezuela",
    status: "published",
    featured_image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
    content: `# Cueva del Guácharo y Caripe: El Misterio Subterráneo y el Aroma a Café de Monagas

> **CLAVES DE TU VISITA A CARIPE:**
> - **Ubicación:** Cordillera Oriental en el estado Monagas, a 2 horas y media de Maturín.
> - **Monumento Natural Alejandro de Humboldt:** La Cueva del Guácharo posee más de 10 kilómetros de longitud explorada (el recorrido turístico abarca 1.200 metros).
> - **El espectáculo del atardecer:** A las 6:00 PM, miles de guácharos (*Steatornis caripensis*) emergen de la cueva en bandadas sincronizadas para alimentarse de frutos de palma.
> - **Caripe 'El Jardín de Oriente':** Clima fresco de montaña, plantaciones de café arábica y posadas campestres con amplios jardines.`
  },
  {
    title: "Parque Nacional Mochima: Playas Esmeralda, Delfines y Posadas Costeras en Sucre y Anzoátegui",
    slug: "parque-nacional-mochima-islas-posadas-puerto-la-cruz-sucre",
    excerpt: "Guía completa de Mochima: islas Arapo, Piscina y Mono, avistamiento de delfines en lancha y posadas náuticas en Puerto La Cruz, Lechería y Cumaná.",
    reading_time: 8,
    author_name: "Equipo Editorial Hoteles de Venezuela",
    status: "published",
    featured_image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    content: `# Parque Nacional Mochima: Playas Esmeralda, Delfines y Posadas Costeras en Sucre y Anzoátegui

> **LO QUE DEBES SABER DE MOCHIMA:**
> - **Embarcaderos principales:** Puerto La Cruz y Lechería (Anzoátegui) y Mochima pueblo o Cumaná (Sucre).
> - **Islas más famosas:** Isla de Plata, Isla Arapo, Playa Piscina (famosa por sus tonos aguamarina) y Cumanagoto.
> - **Avistamiento de delfines:** Las manadas de delfines costeros suelen acompañar a las lanchas durante las travesías matutinas en el Golfo de Santa Fe.
> - **Hospedaje náutico:** Posadas a la orilla del mar con muelles privados y restaurantes de cocina oriental fresca.`
  },
  {
    title: "La Ciénaga de Ocumare de la Costa: El Remanso Turquesa del Parque Henri Pittier",
    slug: "la-cienaga-ocumare-de-la-costa-aragua-posadas-lanchas",
    excerpt: "Descubre La Ciénaga de Ocumare en Aragua: aguas cristalinas de bajo calado, paseos en kayak, túneles de manglares y posadas coloniales en la costa.",
    reading_time: 8,
    author_name: "Equipo Editorial Hoteles de Venezuela",
    status: "published",
    featured_image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    content: `# La Ciénaga de Ocumare de la Costa: El Remanso Turquesa del Parque Henri Pittier

> **CLAVES DE VISITA A LA CIÉNAGA:**
> - **Acceso marítimo:** Salida en peñero de 15 minutos desde el embarcadero de La Boca (Ocumare de la Costa) o Playa Cata.
> - **Características naturales:** Una ensenada marina de aguas calmas sin olas, fondo de arena blanca y manglares protegidos.
> - **Actividades estrella:** Kayak, Stand Up Paddle (SUP) y snorkel en la "Piscina Natural" y la "Cueva del Amor".
> - **Pernocta en tierra firme:** Posadas confortables con piscina y aire acondicionado en El Playón y Ocumare pueblo.`
  },
  {
    title: "Playa El Yaque: La Meca Mundial del Windsurf y Kitesurf en la Isla de Margarita",
    slug: "playa-el-yaque-margarita-viento-kitesurf-hoteles",
    excerpt: "Guía de Playa El Yaque en Margarita: temporadas de viento constante, escuelas certificadas de kitesurf y hoteles frente al mar con reserva directa.",
    reading_time: 8,
    author_name: "Equipo Editorial Hoteles de Venezuela",
    status: "published",
    featured_image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    content: `# Playa El Yaque: La Meca Mundial del Windsurf y Kitesurf en la Isla de Margarita

> **DATOS CLAVE DE PLAYA EL YAQUE:**
> - **Viento de clase mundial:** Vientos alisios constantes de 15 a 30 nudos entre los meses de enero y junio.
> - **Condiciones ideales:** Aguas cálidas, poco profundas y sin corrientes peligrosas, perfectas tanto para deportistas profesionales como para principiantes.
> - **Ubicación estratégica:** A solo 8 minutos del Aeropuerto Internacional Santiago Mariño de Margarita.
> - **Hoteles a pie de playa:** Hospedajes deportivos y de descanso con almacenamiento seguro de equipos y restaurantes frente al mar.`
  },
  {
    title: "Choroní y Travesía a Chuao: Selva del Henri Pittier, Cacao con D.O.P. y Mar Caribe",
    slug: "choroni-puerto-colombia-chuao-cacao-posadas-aragua",
    excerpt: "Guía de viaje a Choroní y Chuao: cruce del Parque Henri Pittier, Playa Grande, plantaciones de cacao D.O.P. Chuao, cascada El Chorrerón y posadas coloniales.",
    reading_time: 9,
    author_name: "Equipo Editorial Hoteles de Venezuela",
    status: "published",
    featured_image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    content: `# Choroní y Travesía a Chuao: Selva del Henri Pittier, Cacao con D.O.P. y Mar Caribe

> **CLAVES DE VIAJE A CHORONÍ Y CHUAO:**
> - **La carretera de montaña:** Espectacular travesía de 44 km atravesando la selva nublada del Parque Nacional Henri Pittier desde Maracay.
> - **Puerto Colombia y Playa Grande:** El corazón turístico de Choroní, con su extensa playa bordeada de cocoteros y oleaje caribeño.
> - **La expedición en peñero a Chuao:** 20 minutos de navegación marítima para llegar al pueblo que produce el cacao fino de aroma más cotizado del planeta.
> - **Trekking a la Cascada El Chorrerón:** Caminata de 2 horas remontando el río Chuao hasta una imponente caída de agua de 70 metros oculta en la selva.`
  },
  {
    title: "Cabo San Román y Salinas de Cumaraguas: La Ruta del Viento y Aguas Rosadas en Paraguaná",
    slug: "cabo-san-roman-salinas-cumaraguas-paraguana-posadas",
    excerpt: "Descubre el Cabo San Román y las Salinas de Cumaraguas en Falcón: el extremo norte de Venezuela, atardeceres rosados y posadas con encanto en Paraguaná.",
    reading_time: 8,
    author_name: "Equipo Editorial Hoteles de Venezuela",
    status: "published",
    featured_image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    content: `# Cabo San Román y Salinas de Cumaraguas: La Ruta del Viento y Aguas Rosadas en Paraguaná

> **DATOS CLAVE DE LA PENÍNSULA DE PARAGUANÁ:**
> - **Cabo San Román:** El punto continental más septentrional de Venezuela y de América del Sur (en días claros se aprecian las luces de la isla de Aruba a solo 31 km).
> - **Salinas de Cumaraguas:** Lagunas de evaporación de sal que adquieren un intenso color rosado y magenta al caer la tarde por la presencia de microorganismos halófilos (*Dunaliella salina*).
> - **Viento y deportes náuticos:** Playas como Adícora son reconocidas mundialmente para la práctica de kitesurf y windsurf.
> - **Gastronomía falconiana:** Chivo en coco, queso de cabra artesanal y mariscos frescos de la costa.`
  },
  {
    title: "Safaris en los Llanos Venezolanos: Fauna Silvestre, Chigüires y Hatos Ecoturísticos",
    slug: "safaris-llanos-venezolanos-hatos-fauna-apure-barinas",
    excerpt: "Guía de safaris fotográficos en los Llanos de Apure y Barinas: avistamiento de chigüires, anacondas, caimanes del Orinoco y hatos ecoturísticos.",
    reading_time: 9,
    author_name: "Equipo Editorial Hoteles de Venezuela",
    status: "published",
    featured_image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    content: `# Safaris en los Llanos Venezolanos: Fauna Silvestre, Chigüires y Hatos Ecoturísticos en Apure y Barinas

> **CLAVES DEL SAFARI LLANERO:**
> - **Mejor temporada:** Temporada seca (diciembre a abril), cuando los esteros se concentran y la fauna silvestre se agrupa alrededor de los cuerpos de agua.
> - **Especies emblemáticas:** Chigüires (capibaras), caimán del Orinoco, oso palmero (hormiguero gigante), anacondas y más de 350 especies de aves acuáticas (corocoras rojas, garzas paletas y jabirús).
> - **Hospedaje en Hatos:** Hatos ganaderos tradicionales adaptados al turismo de conservación con guías baquianos y safaris en lancha o camiones descubiertos.`
  },
  {
    title: "Médanos de Coro y Casco Colonial: Dunas del Caribe y Patrimonio Mundial de la UNESCO",
    slug: "medanos-de-coro-casco-colonial-falcon-posadas",
    excerpt: "Guía de Santa Ana de Coro: atardeceres en el Parque Nacional Médanos de Coro, arquitectura colonial en barro de la UNESCO y casonas coloniales con reserva directa.",
    reading_time: 8,
    author_name: "Equipo Editorial Hoteles de Venezuela",
    status: "published",
    featured_image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
    content: `# Médanos de Coro y Casco Colonial: Dunas del Caribe y Patrimonio Mundial de la UNESCO

> **LO QUE DEBES SABER DE CORO:**
> - **Patrimonio de la Humanidad:** Santa Ana de Coro y su puerto real de La Vela fueron declarados Patrimonio Mundial por la UNESCO en 1993 por su arquitectura en barro y adobe única en el Caribe.
> - **Parque Nacional Médanos de Coro:** Dunas de arena móvil de hasta 30 metros de altura que cambian de forma con los vientos alisios.
> - **Atracciones culturales:** Balcón de los Bolívar, Casa de las Ventanas de Hierro y Cruz de San Clemente.
> - **Hospedaje con historia:** Casonas coloniales de patios interiores con tejas rojas y fuentes coloniales restauradas con todas las comodidades modernas.`
  },
  {
    title: "El Callao, Carnaval y la Ruta del Oro: Tradición UNESCO, Madamas y Joyas en Bolívar",
    slug: "el-callao-carnaval-ruta-del-oro-calipso-bolivar",
    excerpt: "Guía de El Callao: tradición inmaterial de la UNESCO, repique del bumbac, Madamas del Calipso, orfebrería de oro de 18k/24k y posadas culturales en Bolívar.",
    reading_time: 8,
    author_name: "Equipo Editorial Hoteles de Venezuela",
    status: "published",
    featured_image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    content: `# El Callao, Carnaval y la Ruta del Oro: Tradición UNESCO, Madamas y Joyas en Bolívar

> **CLAVES DE EL CALLAO Y LA RUTA DEL ORO:**
> - **Patrimonio Cultural Inmaterial UNESCO:** El Carnaval de El Callao y sus comparsas de Madamas, Diablos y MedioPintos.
> - **El Calipso de El Callao:** Ritmo afroantillano vibrante interpretado con tambores bumbac, campana y cuatro.
> - **Orfebrería en Oro Certificado:** Talleres tradicionales donde se forjan piezas artesanales de oro cochano de 18k y 24k.
> - **Gastronomía afroantillana:** Kalalú, pan inglés (*Yannikeke*) y vino de jengibre (*Ginger beer*).`
  },
  {
    title: "Parque de la Exótica Flora Tropical: El Jardín Botánico Secreto y la Misión Colonial de Yaracuy",
    slug: "parque-exotica-flora-tropical-san-felipe-yaracuy-posadas",
    excerpt: "Descubre el Parque de la Exótica Flora Tropical en San Felipe, Yaracuy: colecciones mundiales de heliconias, canopy forestal y la histórica Misión de San José de 1720.",
    reading_time: 8,
    author_name: "Equipo Editorial Hoteles de Venezuela",
    status: "published",
    featured_image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    content: `# Parque de la Exótica Flora Tropical: El Jardín Botánico Secreto y la Misión Colonial de Yaracuy

> **DATOS CLAVE DEL PARQUE:**
> - **Ubicación:** San Felipe, estado Yaracuy (a 2 horas y media de Valencia o Barquisimeto).
> - **Colección botánica:** Más de 2.500 variedades de plantas tropicales y heliconias procedentes de América, Asia y África diseñadas por el botánico francés Jean Phillipe Thoze.
> - **Patrimonio histórico:** Antigua Misión Capuchina de San José de 1720, restaurada con fuentes y terrazas coloniales.
> - **Aventura ecológica:** Circuito de tirolesa / canopy sobre las copas de los árboles centenarios.`
  },
  {
    title: "Barquisimeto Musical, Sanare y Cubiro: Manto de María, Lomas Verdes y Tradición Larense",
    slug: "barquisimeto-sanare-cubiro-turismo-posadas-lara",
    excerpt: "Guía de viaje a Lara: monumento Manto de María en Barquisimeto, clima frío en las Lomas de Cubiro, folklore de las Zaragozas de Sanare y posadas campestres.",
    reading_time: 8,
    author_name: "Equipo Editorial Hoteles de Venezuela",
    status: "published",
    featured_image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    content: `# Barquisimeto Musical, Sanare y Cubiro: Manto de María, Lomas Verdes y Tradición Larense

> **CLAVES DEL CIRCUITO LARENSE:**
> - **Barquisimeto: La Capital Musical:** Monumento cinético Manto de María Divina Pastora (el más alto del mundo en su tipo), Catedral de Barquisimeto y Flor de Venezuela de Fruto Vivas.
> - **Las Lomas de Cubiro:** Colinas de pasto verde a 1.900 msnm con clima fresco, paseos a caballo y dulcería criolla.
> - **Sanare y el Parque Nacional Yacambú:** Pueblo artesanal, cascadas cristalinas y la tradicional fiesta de los Santos Inocentes (Las Zaragozas).
> - **Gastronomía:** Chivo larense en diferentes preparaciones, lomo prensado de Carora, suero de leche de cabra y panes dulces de El Tocuyo.`
  },
  {
    title: "La Ruta del Cacao en Barlovento: El Secreto Más Dulce (y Subterráneo) a Dos Horas de Caracas",
    slug: "ruta-del-cacao-barlovento-curiepe-birongo-cueva-alfredo-jahn",
    excerpt: "Descubre la Ruta del Cacao en Barlovento: haciendas de Carenero Superior, espeleología en la Cueva Alfredo Jahn y posadas agroturísticas sin comisiones.",
    reading_time: 8,
    author_name: "Equipo Editorial Hoteles de Venezuela",
    status: "published",
    featured_image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    content: `# La Ruta del Cacao en Barlovento: El Secreto Más Dulce (y Subterráneo) a Dos Horas de Caracas

> **LO QUE DEBES SABER ANTES DE ARRANCAR HACIA BARLOVENTO:**
> - **El tesoro agrícola:** Barlovento es la cuna del cacao *Carenero Superior*, reconocido mundialmente por sus notas florales y frutales.
> - **Aventura kárstica en Birongo:** La Cueva Alfredo Jahn cuenta con más de 4,2 kilómetros de galerías subterráneas activas. Requiere guía local certificado.
> - **La experiencia en hacienda:** Recorridos con degustación de mucílago fresco, visita a los patios de secado y talleres de bombonería artesanal.
> - **Cero comisiones intermediarias:** Alojamientos agroturísticos y posadas campestres con piscinas y respaldo eléctrico en Curiepe y Barlovento.`
  },
  {
    title: "Pampatar: El Epicentro Gourmet y Colonial que Reinventó el Lujo en la Isla de Margarita",
    slug: "pampatar-ruta-gastronomica-margarita-castillo-borromeo-hoteles",
    excerpt: "Descubre la capital culinaria de Margarita: restaurantes de autor en Pampatar, Castillo San Carlos de Borromeo y hoteles boutique con reserva directa.",
    reading_time: 9,
    author_name: "Equipo Editorial Hoteles de Venezuela",
    status: "published",
    featured_image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    content: `# Pampatar: El Epicentro Gourmet y Colonial que Reinventó el Lujo en la Isla de Margarita

> **CLAVES PARA TU EXPERIENCIA EN PAMPATAR:**
> - **La Capital Gastronómica del Caribe Venezolano:** Pampatar concentra la mayor densidad de propuestas culinarias de autor del país, con pesca fresca y ají dulce margariteño.
> - **Patrimonio vivo a orillas del mar:** Castillo San Carlos de Borromeo (siglo XVII) y la Iglesia del Santísimo Cristo del Buen Viaje.
> - **Vida nocturna cosmopolita:** Coctelería de autor, cafés de especialidad y terrazas frente a la bahía colonial.
> - **Reserva directa de alto nivel:** Hoteles boutique con plantas eléctricas al 100%, desalinización propia y conserjería personalizada.`
  }
];

async function seed() {
  const resolver = new dns.Resolver();
  resolver.setServers(['1.1.1.1', '8.8.8.8']);
  const ips = await resolver.resolve4(host);

  const client = new Client({
    host: ips[0],
    port: 6543,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false }
  });
  client.connectionParameters.servername = host;

  await client.connect();
  console.log("Connected to Supabase PostgreSQL database.");

  try {
    for (const r of reports) {
      const query = `
        INSERT INTO blog_posts (title, slug, excerpt, content, featured_image, author_name, reading_time, status, published_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        ON CONFLICT (slug) 
        DO UPDATE SET
          title = EXCLUDED.title,
          excerpt = EXCLUDED.excerpt,
          content = EXCLUDED.content,
          featured_image = EXCLUDED.featured_image,
          author_name = EXCLUDED.author_name,
          reading_time = EXCLUDED.reading_time,
          status = EXCLUDED.status,
          updated_at = NOW();
      `;

      await client.query(query, [
        r.title,
        r.slug,
        r.excerpt,
        r.content,
        r.featured_image,
        r.author_name,
        r.reading_time,
        r.status
      ]);
      console.log(`✓ Inserted/Updated: ${r.slug}`);
    }

    console.log(`\nAll ${reports.length} destination reports have been successfully seeded into blog_posts!`);
  } catch (err) {
    console.error("Error during seeding:", err);
  } finally {
    await client.end();
  }
}

seed().catch(console.error);
