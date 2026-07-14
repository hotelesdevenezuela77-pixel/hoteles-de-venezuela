import pg from 'pg';
import dns from 'dns/promises';

const { Client } = pg;

const password = '+Q5Wpz.TXK6@w_2';
const projectRef = 'ghgetcznlrilgocwigmj';
const user = `postgres.${projectRef}`;
const database = 'postgres';
const host = 'aws-1-us-west-2.pooler.supabase.com';

async function run() {
  const resolver = new dns.Resolver();
  resolver.setServers(['1.1.1.1', '8.8.8.8']);

  console.log(`Resolving IP for ${host}...`);
  const ips = await resolver.resolve4(host);
  const ip = ips[0];
  console.log(`Resolved IP: ${ip}`);

  const client = new Client({
    host: ip,
    port: 6543,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false }
  });
  client.connectionParameters.servername = host;

  console.log("Connecting to PostgreSQL...");
  await client.connect();
  console.log("Connected successfully!");

  try {
    console.log("Adding column is_circuito_excelencia and creating script_templates table...");

    const sqlScript = `
      -- 1. Agregar columna is_circuito_excelencia a la tabla establishments si no existe
      ALTER TABLE public.establishments ADD COLUMN IF NOT EXISTS is_circuito_excelencia BOOLEAN DEFAULT FALSE;

      -- Actualizar un par de hoteles a True para tener datos de prueba realistas
      UPDATE public.establishments 
      SET is_circuito_excelencia = TRUE 
      WHERE slug IN ('sabbia-by-ld-hoteles', 'posada-la-ardilena') OR id = 7;

      -- 2. Crear la tabla de script_templates si no existe
      CREATE TABLE IF NOT EXISTS public.script_templates (
          id SERIAL PRIMARY KEY,
          membership_tier TEXT NOT NULL, -- 'basico', 'imagen_corporativa', 'premium', 'complejo_turistico'
          request_type TEXT NOT NULL, -- 'precio', 'disponibilidad', 'servicios', 'fotos'
          template_structure TEXT NOT NULL, -- Estructura base del guion
          follow_up_suggestion TEXT NOT NULL, -- Sugerencia de seguimiento
          sales_note TEXT NOT NULL, -- Nota de ventas
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Habilitar RLS
      ALTER TABLE public.script_templates ENABLE ROW LEVEL SECURITY;

      -- Eliminar políticas anteriores si existen
      DROP POLICY IF EXISTS "Allow public all on script_templates" ON public.script_templates;

      -- Crear política pública total para facilidad en la demo
      CREATE POLICY "Allow public all on script_templates" ON public.script_templates FOR ALL USING (true) WITH CHECK (true);

      -- 3. Limpiar tabla antes de insertar para evitar duplicados en re-ejecución
      TRUNCATE TABLE public.script_templates;

      -- 4. Insertar datos iniciales para cada combinación
      INSERT INTO public.script_templates (membership_tier, request_type, template_structure, follow_up_suggestion, sales_note)
      VALUES
      -- Básica + Precio
      ('basico', 'precio', 
       'Estimado [Cliente],\n\nMuchas gracias por su interés en [Hotel]. Nos entusiasma la posibilidad de hospedarle en nuestro [Categoria].\n\nPara poder ofrecerle una cotización precisa y a la medida de lo que busca, ¿podría compartirnos para qué fecha tiene planificado su viaje y para cuántas personas sería la estadía?\n\nQueremos comentarle que, como miembro de Hoteles de Venezuela, contamos con un canal de reserva directa que nos permite garantizarle la mejor tarifa disponible, libre de comisiones de intermediarios y con trato personalizado desde el primer momento.\n\nQuedamos a su entera disposición para coordinar los detalles. ¿Qué fechas tiene en mente?',
       'Día 1: Enviar un mensaje breve por WhatsApp preguntando si logró definir las fechas de su viaje o si requiere asistencia con la selección de la habitación.',
       'Priorizar la obtención de las fechas del viaje y el número de huéspedes para cerrar la cotización formal.'),

      -- Básica + Disponibilidad
      ('basico', 'disponibilidad',
       'Estimado [Cliente],\n\nLe damos las gracias por contactar a [Hotel]. Nos encantaría hospedarle en nuestro [Categoria] en sus próximas vacaciones.\n\nPara confirmar la disponibilidad para sus fechas ideales, ¿nos podría indicar qué tipo de habitación prefiere y cuántas personas viajan con usted?\n\nLe recordamos que al reservar directamente con nosotros a través de la plataforma de Hoteles de Venezuela, usted evita recargos de agencias de viajes y comisiones externas, recibiendo asistencia inmediata de nuestro personal.\n\nEsperamos sus comentarios. ¿Qué fechas tiene pensadas?',
       'Día 3: Enviar un recordatorio amistoso indicando si aún está interesado en verificar la disponibilidad para sus fechas.',
       'Confirmar las fechas exactas y el tipo de habitación requerida.'),

      -- Básica + Servicios
      ('basico', 'servicios',
       'Estimado [Cliente],\n\nEs un placer saludarle de parte de [Hotel]. Agradecemos su consulta sobre nuestras instalaciones y servicios.\n\nPara brindarle información específica de su interés, ¿podría decirnos si viaja por un evento especial, descanso familiar o viaje de negocios?\n\nLe invitamos a conocer todos los servicios disponibles directamente en nuestra ficha oficial de Hoteles de Venezuela. Al reservar de manera directa en nuestro canal oficial, garantizamos que no pagará comisiones adicionales de agencias externas.\n\n¿Tiene alguna duda en particular sobre algún servicio que podamos aclararle?',
       'Día 7: Compartir un folleto digital de servicios o tarifas adicionales y preguntar si tiene interés en algún servicio específico.',
       'Destacar los servicios incluidos en la reserva directa para aumentar el valor percibido.'),

      -- Básica + Fotos
      ('basico', 'fotos',
       'Estimado [Cliente],\n\nMuchas gracias por contactar a [Hotel]. Con gusto le compartimos material visual de nuestro [Categoria].\n\nPara enviarle las imágenes o videos que mejor se ajusten a su consulta, ¿le gustaría ver las habitaciones, las áreas comunes o nuestros paisajes y playas comunes?\n\nLe invitamos a ingresar a nuestra galería completa en la plataforma oficial de Hoteles de Venezuela, donde podrá ver fotos reales verificadas y gestionar su comunicación directa sin comisiones intermedias.\n\n¿Qué tipo de habitación le gustaría ver en mayor detalle?',
       'Día 1: Compartir un enlace de la galería de fotos verificadas por WhatsApp y preguntar qué habitación le llamó más la atención.',
       'Utilizar el gancho visual de las instalaciones para abrir la conversación de reserva.'),

      -- Premium + Precio
      ('premium', 'precio',
       'Estimado [Cliente],\n\nLe agradecemos cordialmente su contacto con [Hotel], un miembro verificado de alta gama en Hoteles de Venezuela.\n\nPara cotizar a la medida de sus expectativas en nuestro [Categoria], ¿podría indicar el tipo de suite de su preferencia, las fechas tentativas de su estadía y el número de huéspedes?\n\nAl ser un hotel con insignia Premium de búsqueda prioritaria en la red nacional, le garantizamos la mejor tarifa del mercado en nuestro canal de reserva directa, libre de comisiones y con prioridad de atención en todos los requerimientos.\n\nQuedamos a su entera disposición. ¿Cuándo tiene planeado visitarnos?',
       'Día 1: Enviar un mensaje personalizado por WhatsApp con el desglose de tarifas de las opciones solicitadas.',
       'Priorizar la llamada telefónica o contacto directo para concretar la tarifa del viaje.'),

      -- Premium + Disponibilidad
      ('premium', 'disponibilidad',
       'Estimado [Cliente],\n\nLe agradecemos cordialmente su contacto con [Hotel], un miembro verificado de nuestra colección de hospedajes en Hoteles de Venezuela.\n\nPara verificar la disponibilidad exacta en nuestro [Categoria] y asegurar su espacio, ¿nos podría indicar si las fechas de su viaje son flexibles o si cuenta con un tipo de habitación de su preferencia?\n\nAl ser un establecimiento con insignia Premium de búsqueda prioritaria en la plataforma, le garantizamos acceso preferencial a nuestras mejores suites y una confirmación directa e inmediata sin cargos adicionales.\n\nQuedamos atentos a sus comentarios para asegurar su reserva. ¿Le gustaría que le enviemos las opciones disponibles para sus fechas?',
       'Día 3: Realizar seguimiento enviando un mensaje consultando si tiene alguna duda sobre los tipos de habitación o las fechas disponibles consultadas.',
       'Enfocarse en crear urgencia suave destacando la alta demanda del hotel y la prioridad del canal directo.'),

      -- Premium + Servicios
      ('premium', 'servicios',
       'Estimado [Cliente],\n\nReciba un cordial saludo de parte del equipo de [Hotel]. Agradecemos su interés en los servicios premium de nuestro [Categoria].\n\nCon el fin de personalizar al máximo su experiencia de hospedaje, ¿requiere algún servicio especial como traslados privados, alimentación a la carta o actividades guiadas en la zona?\n\nAl reservar a través de nuestro canal verificado en Hoteles de Venezuela, usted cuenta con el respaldo de nuestro distintivo de calidad Premium y prioridad en la gestión de servicios especiales, asegurando una estadía fluida y 100% coordinada sin intermediarios.\n\n¿Le gustaría coordinar una llamada breve para planificar los servicios exclusivos de su estadía?',
       'Día 7: Enviar una propuesta premium en PDF que agrupe los servicios especiales e invite a reservar con prioridad.',
       'Vender la experiencia completa y el confort verificado del establecimiento Premium.'),

      -- Premium + Fotos
      ('premium', 'fotos',
       'Estimado [Cliente],\n\nEs un placer saludarle de parte de [Hotel]. Agradecemos su solicitud de material visual para nuestro [Categoria].\n\nPara enviarle las imágenes de alta resolución que mejor muestren la experiencia que busca, ¿desea ver nuestras suites exclusivas, áreas recreativas o la vista panorámica del establecimiento?\n\nComo miembro Premium destacado con badge verificado de Hoteles de Venezuela, nuestras instalaciones cumplen con altos estándares visuales y de calidad. Le adjuntamos las fotografías oficiales verificadas.\n\n¿Qué área del hotel le gustaría detallar más para su próxima estadía?',
       'Día 1: Enviar por WhatsApp el portafolio fotográfico oficial del hotel con una nota amable ofreciendo disponibilidad.',
       'Generar deseo de compra utilizando la exclusividad visual y el badge verificado del hotel.'),

      -- Imagen Corporativa + Precio
      ('imagen_corporativa', 'precio',
       'Estimado [Cliente],\n\nMuchas gracias por su comunicación con [Hotel]. Apreciamos su consulta sobre las tarifas de nuestro [Categoria].\n\nPara diseñarle una propuesta tarifaria estructurada y acorde a su viaje, ¿nos podría compartir si viaja de forma individual por negocios o en grupo, así como las fechas proyectadas?\n\nEn [Hotel], como miembros distinguidos del portal nacional de Hoteles de Venezuela con presencia de Imagen Corporativa, garantizamos total transparencia comercial en nuestro canal de reserva directa con cero comisiones ocultas, respaldando nuestro branding y la calidad oficial de nuestra marca.\n\nQuedamos a su disposición para coordinar los detalles. ¿Qué fechas prefiere cotizar?',
       'Día 1: Enviar por correo electrónico una propuesta de cotización formal corporativa en formato PDF.',
       'Priorizar la claridad tarifaria y destacar la transparencia de reservar sin intermediarios con una marca sólida.'),

      -- Imagen Corporativa + Disponibilidad
      ('imagen_corporativa', 'disponibilidad',
       'Estimado [Cliente],\n\nAgradecemos su interés por reservar en [Hotel]. Nos complace atender su consulta sobre nuestra disponibilidad.\n\nPara brindarle opciones exactas y alineadas a su agenda, ¿podría indicar la fecha de llegada proyectada y si su estadía es por motivos de negocios o placer?\n\nComo un hotelero de Imagen Corporativa y branding verificado en la red de Hoteles de Venezuela, le garantizamos la mayor fidelidad en la información de inventario y comunicación directa para bloquear sus espacios de inmediato sin cargos sorpresa.\n\n¿Desea que verifiquemos disponibilidad para alguna habitación en particular?',
       'Día 3: Enviar un recordatorio por WhatsApp o email sobre las opciones de disponibilidad presentadas anteriormente.',
       'Enfocarse en asegurar las fechas en la agenda del cliente destacando la seriedad y solidez institucional del hotel.'),

      -- Imagen Corporativa + Servicios
      ('imagen_corporativa', 'servicios',
       'Estimado [Cliente],\n\nEs un placer saludarle de parte de todo el equipo de [Hotel]. Apreciamos su consulta sobre los servicios de nuestro [Categoria].\n\nCon el fin de personalizar su experiencia, ¿está planificando un viaje de descanso corporativo o una escapada familiar? ¿Tiene algún requerimiento especial de conectividad o alimentación?\n\nEn [Hotel] nos enorgullece ofrecer una experiencia de hospitalidad integral. Como socio de Imagen Corporativa de Hoteles de Venezuela, nuestra propuesta visual y estándares de servicio están diseñados para reflejar la identidad y excelencia de nuestra marca en cada detalle de su estadía, garantizándole confort absoluto y soporte continuo.\n\nEstaremos encantados de hospedarle. ¿Le gustaría que agendemos una llamada breve para afinar los servicios especiales para su llegada?',
       'Día 7: Enviar una propuesta detallada en PDF con el brochure corporativo del hotel y un mensaje de seguimiento por correo electrónico.',
       'Posicionar los servicios exclusivos del hotel como el estándar de oro para su estadía, facilitando la reserva directa.'),

      -- Imagen Corporativa + Fotos
      ('imagen_corporativa', 'fotos',
       'Estimado [Cliente],\n\nLe saludamos cordialmente de parte de [Hotel] y agradecemos su interés en conocer visualmente nuestro [Categoria].\n\nPara proporcionarle material adaptado a sus requerimientos, ¿tiene preferencia por ver nuestras salas de reuniones y conectividad, o prefiere imágenes de las suites y áreas de relajación?\n\nNuestra presencia oficial en Hoteles de Venezuela destaca por una sólida Imagen Corporativa y branding. Le invitamos a explorar nuestra galería de fotos oficiales y de alta resolución que reflejan con total fidelidad el diseño y confort que le esperan.\n\n¿Cuál de nuestras suites le interesaría ver con mayor detalle?',
       'Día 1: Enviar el enlace directo a la sección multimedia de la página personalizada del hotel con fotos en alta resolución.',
       'Utilizar la impecable identidad visual de la marca para transmitir profesionalismo y atraer la reserva directa.'),

      -- Complejo Turístico + Precio
      ('complejo_turistico', 'precio',
       'Estimado [Cliente],\n\nLe damos la bienvenida a [Hotel]. Agradecemos su consulta de tarifas para nuestro complejo turístico.\n\nPara cotizar la experiencia completa que ofrece nuestro resort, ¿podría indicarnos la fecha de su viaje, número de adultos y niños, y si le interesa incluir planes de actividades o comidas?\n\nAl reservar directamente en nuestro complejo en la red Hoteles de Venezuela, usted accede al ecosistema de tarifa directa garantizada sin comisiones de OTAs intermedias, permitiéndole personalizar su plan vacacional al mejor costo.\n\nQuedamos a su servicio. ¿Qué fechas tiene planificadas para su estadía?',
       'Día 1: Realizar seguimiento vía WhatsApp ofreciendo un presupuesto dinámico de actividades y alojamiento.',
       'Priorizar el paquete completo de resort y las ventajas económicas del canal directo sin comisiones.'),

      -- Complejo Turístico + Disponibilidad
      ('complejo_turistico', 'disponibilidad',
       'Estimado [Cliente],\n\nLe agradecemos su comunicación con [Hotel]. Nos entusiasma brindarle detalles de disponibilidad para nuestro complejo turístico.\n\nDado que contamos con múltiples áreas y tipos de hospedaje para sus fechas estimadas, ¿podría compartirnos cuántas personas viajan y si prefiere una villa familiar, cabaña o suite estándar?\n\nAl ser parte de los complejos turísticos oficiales de Hoteles de Venezuela, nuestro sistema de reserva directa le garantiza acceso prioritario al inventario completo del resort, asegurando su reserva sin sobrecargos ni intermediarios.\n\n¿Le gustaría que verifiquemos la disponibilidad de alguna villa en específico?',
       'Día 3: Enviar mensaje de seguimiento mostrando las opciones de alojamiento que tienen menor inventario para generar urgencia.',
       'Destacar la alta ocupación del complejo para incentivar una reserva directa rápida en sus fechas.'),

      -- Complejo Turístico + Servicios
      ('complejo_turistico', 'servicios',
       'Estimado [Cliente],\n\nEs un placer saludarle en nombre de [Hotel]. Agradecemos su interés en el ecosistema de servicios de nuestro complejo turístico.\n\nPara asesorarle adecuadamente, ¿está interesado en conocer sobre nuestro club recreativo, piscinas, restaurantes temáticos o servicios de excursiones y traslados?\n\nComo complejo vacacional destacado en Hoteles de Venezuela, ofrecemos una infraestructura de servicios integrada. Reservando de forma directa, usted tiene la seguridad de contar con toda la coordinación de sus consumos y actividades preferenciales sin intermediación.\n\n¿Desea que agendemos una llamada de asistencia para diseñar las actividades de su estadía?',
       'Día 7: Compartir la guía de actividades y el mapa interactivo del resort, invitando a reservar con una llamada directa.',
       'Posicionar la rica oferta de actividades del complejo turístico como el valor de conversión definitivo.'),

      -- Complejo Turístico + Fotos
      ('complejo_turistico', 'fotos',
       'Estimado [Cliente],\n\nLe damos una calurosa bienvenida y agradecemos su interés en explorar las maravillas de [Hotel], nuestro complejo turístico de primer nivel.\n\nPara compartirle la selección de fotos que mejor se adapte a sus expectativas, ¿está interesado en conocer nuestras áreas de esparcimiento, la gastronomía, o prefiere ver el interior y vistas de nuestras suites?\n\nComo un complejo turístico destacado en la red oficial de Hoteles de Venezuela, contamos con una infraestructura diseñada para brindarle una experiencia vacacional completa, con reservas directas y transparentes sin comisiones externas.\n\nLe invitamos a revisar nuestra galería completa adjunta. ¿Cuál de nuestras instalaciones le llama más la atención para su próximo viaje?',
       'Día 1: Compartir por WhatsApp un enlace interactivo a la galería fotográfica de alta resolución y preguntar si tiene alguna pregunta sobre las instalaciones.',
       'Utilizar el material visual de alta gama para generar deseo y enganchar al cliente hacia una llamada de reserva.');
    `;

    await client.query(sqlScript);
    console.log("Database updated successfully with column and script templates!");

  } catch (err) {
    console.error("Migration failed:", err.message);
  } finally {
    await client.end();
  }
}

run().catch(console.error);
