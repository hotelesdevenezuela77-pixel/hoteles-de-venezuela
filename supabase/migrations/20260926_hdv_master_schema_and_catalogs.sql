-- ============================================================================
-- MIGRACIÓN MAESTRA: HOTELES DE VENEZUELA (HDV)
-- Modelado Relacional + JSONB Canónico para Catálogos C00 a C11
-- ============================================================================

-- Extensión para UUID si no existe
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TABLAS DE CATÁLOGOS BASE
-- ============================================================================

CREATE TABLE IF NOT EXISTS service_categories (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subcategories (
    id SERIAL PRIMARY KEY,
    service_category_id INT NOT NULL REFERENCES service_categories(id) ON DELETE RESTRICT,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    is_complex_parent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subcategory_parents (
    id SERIAL PRIMARY KEY,
    parent_subcategory_id INT NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
    child_subcategory_id INT NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
    description VARCHAR(255),
    CONSTRAINT uq_parent_child UNIQUE (parent_subcategory_id, child_subcategory_id)
);

CREATE TABLE IF NOT EXISTS street_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS tag_groups (
    id SERIAL PRIMARY KEY,
    parent_id INT REFERENCES tag_groups(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    scope VARCHAR(30) CHECK (scope IN ('ESTABLECIMIENTO', 'UNIDAD', 'AMBOS')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tags_catalog (
    id SERIAL PRIMARY KEY,
    tag_group_id INT NOT NULL REFERENCES tag_groups(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    data_type VARCHAR(30) CHECK (data_type IN ('string', 'integer', 'boolean', 'range', 'json', 'array')) NOT NULL,
    countries VARCHAR(20) DEFAULT 'ALL',
    allowed_subcategories TEXT DEFAULT 'ALL',
    is_search_filter BOOLEAN DEFAULT FALSE,
    search_weight INT DEFAULT 0
);

-- ============================================================================
-- 2. TABLAS DE ESTABLECIMIENTOS Y UNIDADES CON COLUMNA JSONB 'features'
-- ============================================================================

CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_category_id INT NOT NULL REFERENCES service_categories(id) ON DELETE RESTRICT,
    subcategory_id INT NOT NULL REFERENCES subcategories(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    country_code VARCHAR(2) DEFAULT 'VE' NOT NULL,
    state VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE', 'SUSPENDED')),
    is_verified BOOLEAN DEFAULT FALSE,
    features JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS property_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    unit_name VARCHAR(150) NOT NULL,
    unit_type VARCHAR(50) NOT NULL,
    max_occupancy INT NOT NULL DEFAULT 2,
    base_price_night NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    features JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices GIN y B-Tree
CREATE INDEX IF NOT EXISTS idx_properties_features_path_ops ON properties USING GIN (features jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_properties_features_gin ON properties USING GIN (features);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties (country_code, state, city, status);
CREATE INDEX IF NOT EXISTS idx_properties_subcat ON properties (service_category_id, subcategory_id);
CREATE INDEX IF NOT EXISTS idx_property_units_property_id ON property_units (property_id);
CREATE INDEX IF NOT EXISTS idx_property_units_features_gin ON property_units USING GIN (features);

-- ============================================================================
-- 3. INSERTS DE service_categories
-- ============================================================================

INSERT INTO service_categories (id, code, name, description) VALUES
(1, 'HOTEL', 'Alojamiento tipo Hotel', 'Establecimientos hoteleros, hostales, posadas, moteles y afines.'),
(2, 'CASA', 'Alojamiento tipo Casa / Apartamento', 'Villas, chalets, cabañas y unidades residenciales completas.'),
(3, 'AGRUPACION', 'Alojamiento tipo Agrupación de unidades habitacionales', 'Campings, resorts, aldeas turísticas y complejos vacacionales.'),
(4, 'NAUTICO', 'Embarcaciones y Servicios Náuticos', 'Barcos habitacionales, chárters, veleros, yates y marinas.')
ON CONFLICT (id) DO UPDATE SET 
    code = EXCLUDED.code,
    name = EXCLUDED.name, 
    description = EXCLUDED.description;

-- ============================================================================
-- 4. INSERTS DE subcategories (Sanitizadas y Deduplicadas)
-- ============================================================================

INSERT INTO subcategories (id, service_category_id, code, name, is_complex_parent) VALUES
-- Categoría 1: Hotelería
(5, 1, 'HOTEL_ESTANDAR', 'Hoteles', FALSE),
(6, 1, 'HOSTAL_POSADA_MOTEL', 'Hostales, Posadas, Pensiones y Moteles', FALSE),
(7, 1, 'BED_AND_BREAKFAST', 'Bed and breakfast', FALSE),
(8, 1, 'HAB_CASA_PARTICULAR', 'Habitaciones en casas particulares', FALSE),
(9, 1, 'ALBERGUE_TURISTICO', 'Albergues turísticos', FALSE),
(10, 1, 'RESIDENCIA_ESTUDIANTES', 'Residencias de estudiantes', FALSE),
(11, 1, 'HOTEL_CAPSULA', 'Hoteles cápsula', FALSE),
(12, 1, 'LOVE_HOTEL', 'Love hotels', FALSE),

-- Categoría 2: Alquiler Íntegro (Casas y Chalets)
(1, 2, 'CASA_VACACIONAL', 'Casas y Villas Vacacionales', FALSE),
(2, 2, 'APARTAMENTO_TURISTICO', 'Apartamentos Turísticos', FALSE),
(3, 2, 'CABANA_RURAL', 'Cabañas y Casas Rurales', FALSE),
(4, 2, 'CHALET_MONTANA_ESQUI', 'Casas y Chalets de Montaña (Esquí)', FALSE),

-- Categoría 3: Complejos y Agrupaciones (Padres)
(13, 3, 'CAMPING_GLAMPING', 'Campings y Glampings', TRUE),
(14, 3, 'RESORT_COMPLEJO', 'Resorts y Complejos Turísticos', TRUE),
(15, 3, 'COMPLEJO_MARINA_VACACIONAL', 'Complejos Vacacionales y Marinas', TRUE),

-- Subcategorías Hijas Habitacionales para Complejos (50-62)
(50, 3, 'UNIT_MOBILE_HOME', 'Mobile-home', FALSE),
(51, 3, 'UNIT_BUNGALOW', 'Bungalow', FALSE),
(52, 3, 'UNIT_TIENDA_LONA', 'Tienda de lona', FALSE),
(53, 3, 'UNIT_TIENDA_SAFARI', 'Tienda safari', FALSE),
(54, 3, 'UNIT_TIENDA_TIPI', 'Tienda tipi', FALSE),
(55, 3, 'UNIT_CASA_ARBOLES', 'Casa en los árboles', FALSE),
(56, 3, 'UNIT_YURTA', 'Yurta', FALSE),
(57, 3, 'UNIT_CASA_CABANA_COMPLEJO', 'Casa, Chalet, Cabaña en complejo', FALSE),
(58, 3, 'UNIT_APARTAMENTO_COMPLEJO', 'Apartamento en complejo', FALSE),
(59, 3, 'UNIT_PARCELA_TIENDA', 'Parcela para tienda', FALSE),
(60, 3, 'UNIT_PARCELA_CARAVANA', 'Parcela para caravana', FALSE),
(61, 3, 'UNIT_PARCELA_AUTOCARAVANA', 'Parcela para autocaravana', FALSE),
(62, 3, 'UNIT_HABITACION_COMPLEJO', 'Habitaciones en complejos', FALSE),

-- Categoría 4: Embarcaciones Náuticas (Sanitizado sin conflicto con ID 16)
(16, 4, 'BARCO_ESTATICO_PUERTO', 'Barcos con Alojamiento Estático en Puerto', FALSE),
(17, 4, 'BARCO_NAVEGACION_DIARIA', 'Barcos con Alojamiento y Navegación Diaria Incluida', FALSE)
ON CONFLICT (id) DO UPDATE SET 
    service_category_id = EXCLUDED.service_category_id,
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    is_complex_parent = EXCLUDED.is_complex_parent;

-- ============================================================================
-- 5. INSERTS DE subcategory_parents (Pivote Complejos -> Unidades)
-- ============================================================================

INSERT INTO subcategory_parents (parent_subcategory_id, child_subcategory_id, description) VALUES
(13, 50, 'Mobile-home dentro de Camping'),
(14, 50, 'Mobile-home dentro de Resort'),
(15, 50, 'Mobile-home dentro de Marina'),
(13, 51, 'Bungalow dentro de Camping'),
(14, 51, 'Bungalow dentro de Resort'),
(15, 51, 'Bungalow dentro de Marina'),
(13, 52, 'Tienda de lona dentro de Camping'),
(14, 52, 'Tienda de lona dentro de Resort'),
(15, 52, 'Tienda de lona dentro de Marina'),
(13, 53, 'Tienda safari dentro de Camping'),
(14, 53, 'Tienda safari dentro de Resort'),
(15, 53, 'Tienda safari dentro de Marina'),
(13, 54, 'Tienda tipi dentro de Camping'),
(14, 54, 'Tienda tipi dentro de Resort'),
(15, 54, 'Tienda tipi dentro de Marina'),
(13, 55, 'Casa en los árboles dentro de Camping'),
(14, 55, 'Casa en los árboles dentro de Resort'),
(15, 55, 'Casa en los árboles dentro de Marina'),
(13, 56, 'Yurta dentro de Camping'),
(14, 56, 'Yurta dentro de Resort'),
(15, 56, 'Yurta dentro de Marina'),
(13, 57, 'Casa, Chalet, Cabaña en complejo de Camping'),
(14, 57, 'Casa, Chalet, Cabaña en complejo de Resort'),
(15, 57, 'Casa, Chalet, Cabaña en complejo de Marina'),
(13, 58, 'Apartamento en complejo de Camping'),
(14, 58, 'Apartamento en complejo de Resort'),
(15, 58, 'Apartamento en complejo de Marina'),
(13, 59, 'Parcela para tienda dentro de Camping'),
(14, 59, 'Parcela para tienda dentro de Resort'),
(15, 59, 'Parcela para tienda dentro de Marina'),
(13, 60, 'Parcela para caravana dentro de Camping'),
(14, 60, 'Parcela para caravana dentro de Resort'),
(15, 60, 'Parcela para caravana dentro de Marina'),
(13, 61, 'Parcela para autocaravana dentro de Camping'),
(14, 61, 'Parcela para autocaravana dentro de Resort'),
(15, 61, 'Parcela para autocaravana dentro de Marina'),
(13, 62, 'Habitaciones en complejos de Camping'),
(14, 62, 'Habitaciones en complejos de Resort'),
(15, 62, 'Habitaciones en complejos de Marina')
ON CONFLICT (parent_subcategory_id, child_subcategory_id) DO UPDATE 
SET description = EXCLUDED.description;

-- ============================================================================
-- 6. INSERTS DE street_types (Deduplicados)
-- ============================================================================

INSERT INTO street_types (code, name) VALUES
('ACCESO', 'Acceso'),
('AGREGADO', 'Agregado'),
('ALAMEDA', 'Alameda'),
('ALDEA', 'Aldea'),
('ANDADOR', 'Andador'),
('ANADIR_OTRO', 'Añadir Otro'),
('AREA', 'Área'),
('ARRABAL', 'Arrabal'),
('ARROYO', 'Arroyo'),
('ASENTAMIENTO', 'Asentamiento'),
('AUTOPISTA', 'Autopista'),
('AUTOVIA', 'Autovía'),
('AVENIDA', 'Avenida'),
('BAJADA', 'Bajada'),
('BARRANCO', 'Barranco'),
('BARRIO', 'Barrio'),
('BLOQUE', 'Bloque'),
('BULEVAR', 'Bulevar'),
('CALLE', 'Calle'),
('CALLEJA', 'Calleja'),
('CALLEJON', 'Callejón'),
('CALZADA', 'Calzada'),
('CAMINO', 'Camino'),
('CAMPA', 'Campa'),
('CAMPING', 'Camping'),
('CANAL', 'Canal'),
('CANADA', 'Cañada'),
('CARRETERA', 'Carretera'),
('CARRERA', 'Carrera'),
('CASA', 'Casa'),
('CASCO_HISTORICO', 'Casco Central / Histórico'),
('CASERIO', 'Caserío'),
('CENTRO_COMERCIAL', 'Centro Comercial'),
('CENTRO_EMPRESARIAL', 'Centro Empresarial'),
('CERRADA', 'Cerrada'),
('CHALET', 'Chalet'),
('CIGARRAL', 'Cigarral'),
('CINTURON', 'Cinturón'),
('CIRCUITO', 'Circuito'),
('CIRCUNVALACION', 'Circunvalación'),
('COLONIA', 'Colonia'),
('COMUNIDAD', 'Comunidad'),
('CONCEJO', 'Concejo'),
('CONJUNTO', 'Conjunto'),
('CONJUNTO_CERRADO', 'Conjunto Cerrado'),
('CONJUNTO_RESIDENCIAL', 'Conjunto Residencial'),
('CUESTA_COSTANILLA', 'Cuesta / Costanilla'),
('DETRAS', 'Detrás'),
('DIAGONAL', 'Diagonal'),
('DISEMINADOS', 'Diseminados'),
('DISTRIBUIDOR', 'Distribuidor'),
('EDIFICIO', 'Edificio'),
('ESCALERAS', 'Escaleras / Escalinata'),
('ESQUINA', 'Esquina'),
('ETAPA', 'Etapa'),
('FASE', 'Fase'),
('FINCA', 'Finca'),
('FUNDO', 'Fundo'),
('GLORIETA', 'Glorieta'),
('GRAN_VIA', 'Gran Vía'),
('GRANJA', 'Granja'),
('GRUPO', 'Grupo'),
('HACIENDA', 'Hacienda'),
('HATO', 'Hato'),
('JARDINES', 'Jardines'),
('LADERA', 'Ladera'),
('LOMA', 'Loma'),
('LOTE', 'Lote'),
('MALECON', 'Malecón'),
('MANZANA', 'Manzana'),
('MERCADO', 'Mercado'),
('MONTE', 'Monte'),
('MUELLE', 'Muelle'),
('MUNICIPIO', 'Municipio'),
('PARCELA', 'Parcela'),
('PARQUE', 'Parque'),
('PARTIDA', 'Partida'),
('PASADIZO', 'Pasadizo'),
('PASAJE', 'Pasaje'),
('PASARELA', 'Pasarela'),
('PASEO', 'Paseo'),
('PASEO_DEL_MAR', 'Paseo del Mar'),
('PASEO_MARITIMO', 'Paseo Marítimo'),
('PEATONAL', 'Peatonal'),
('PERIMETRAL', 'Perimetral'),
('PLAZA', 'Plaza'),
('PLAZUELA', 'Plazuela'),
('POBLADO', 'Poblado'),
('POLIGONO', 'Polígono'),
('PRIVADA', 'Privada'),
('PROLONGACION', 'Prolongación'),
('PUENTE', 'Puente'),
('QUINTA', 'Quinta'),
('RAMAL', 'Ramal'),
('RAMBLA', 'Rambla'),
('RAMPA', 'Rampa'),
('REDOMA', 'Redoma'),
('RESIDENCIA', 'Residencia'),
('RETORNO', 'Retorno'),
('RINCON_RINCONADA', 'Rincón / Rinconada'),
('RONDA', 'Ronda'),
('ROTONDA', 'Rotonda'),
('RUA', 'Rúa'),
('SECTOR', 'Sector'),
('SENDA', 'Senda'),
('SOLAR', 'Solar'),
('SUBIDA', 'Subida'),
('TERRENOS', 'Terrenos'),
('TORRE', 'Torre'),
('TORRENTE', 'Torrente'),
('TRANSVERSAL', 'Transversal'),
('TRAVESIA', 'Travesía'),
('TROCHA', 'Trocha'),
('URBANIZACION', 'Urbanización'),
('VEREDA', 'Vereda'),
('VIA', 'Vía'),
('VIADUCTO', 'Viaducto'),
('VIA_PEATONAL', 'Vía Peatonal'),
('VIVIENDA', 'Vivienda'),
('ZONA_INDUSTRIAL', 'Zona Industrial')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 7. INSERTS DE tag_groups (86 Grupos C00 a C11)
-- ============================================================================

INSERT INTO tag_groups (id, parent_id, code, name, scope) VALUES
(1, NULL, 'C00', 'CONFIGURACIÓN INICIAL DEL ESTABLECIMIENTO/SERVICIO', 'ESTABLECIMIENTO'),
(2, 1, 'C00.1', 'INFORMACIÓN GENERAL DEL ESTABLECIMIENTO/SERVICIO', 'ESTABLECIMIENTO'),
(3, 2, 'C00.1.16', 'Etiquetas de dirección (Postal o Fiscal)', 'ESTABLECIMIENTO'),
(4, 2, 'C00.1.15', 'Dirección Postal de la propiedad', 'ESTABLECIMIENTO'),
(5, 2, 'C00.1.16_EMB', 'Dirección de la embarcación', 'ESTABLECIMIENTO'),
(6, 5, 'C00.1.16.1_MARINA', 'Dirección postal del Puerto/Oficinas de la marina', 'ESTABLECIMIENTO'),
(7, 2, 'C00.1.20', 'Entorno', 'ESTABLECIMIENTO'),
(8, 1, 'C00.2', 'DATOS FISCALES DEL ESTABLECIMIENTO/SERVICIO', 'ESTABLECIMIENTO'),
(9, 8, 'C00.2.4', 'Dirección Fiscal de la Sociedad', 'ESTABLECIMIENTO'),
(10, 8, 'C00.2.5', 'Dirección Fiscal del Propietario o Armador', 'ESTABLECIMIENTO'),
(11, 1, 'C00.3', 'CONTACTO OPERATIVO DEL ESTABLECIMIENTO/SERVICIO', 'ESTABLECIMIENTO'),
(12, 11, 'C00.3.1', 'Contacto con HDV', 'ESTABLECIMIENTO'),
(13, 11, 'C00.3.2', 'Contacto con clientes', 'ESTABLECIMIENTO'),
(14, 1, 'C00.4', 'CALIFICACIONES OFICIALES Y DISTINCIONES GASTRONÓMICAS DEL ESTABLECIMIENTO', 'ESTABLECIMIENTO'),
(15, 1, 'C00.5', 'CERTIFICACIONES AMBIENTALES, SOSTENIBILIDAD Y NICHO DEL ESTABLECIMIENTO', 'ESTABLECIMIENTO'),
(16, 1, 'C00.6', 'DISTANCIA DESDE EL ESTABLECIMIENTO A LUGARES DE INTERES', 'ESTABLECIMIENTO'),
(17, 16, 'C00.6.1', 'Tipología de lugar', 'ESTABLECIMIENTO'),
(18, NULL, 'C01', 'DISTRIBUCIÓN DE LA UNIDAD DE ALOJAMIENTO (HABITACIÓN/CASA)', 'UNIDAD'),
(19, 18, 'C01.1', 'Distribución de la habitación (Tipo HOTEL)', 'UNIDAD'),
(20, 18, 'C01.2', 'Distribución de la unidad de alquiler íntegro (Tipo CASAS - APARTAMENTOS - BARCOS)', 'UNIDAD'),
(21, NULL, 'C02', 'EQUIPAMIENTO E INFRAESTRUCTURA DE LA UNIDAD DE ALOJAMIENTO (HABITACIÓN/CASA)', 'UNIDAD'),
(22, 21, 'C02.1', 'Número y Tipo de camas por unidad habitacional / dormitorio / camarote', 'UNIDAD'),
(23, 21, 'C02.2', 'Equipamiento de la Unidad Privada (habitaciones o recámaras / dormitorios / camarotes)', 'UNIDAD'),
(24, 23, 'C02.2.1', 'Descanso y Confort', 'UNIDAD'),
(25, 23, 'C02.2.2', 'Climatización y Suministros (Privado)', 'UNIDAD'),
(26, 23, 'C02.2.3', 'Tecnología y Entretenimiento (Privado)', 'UNIDAD'),
(27, 23, 'C02.2.4', 'Zona de Trabajo y Estar (Privado)', 'UNIDAD'),
(28, 21, 'C02.3', 'Exteriores Privados - Integrados en la unidad privada', 'UNIDAD'),
(29, 21, 'C02.4', 'Equipamiento de baños y cocinas (privados o compartidos)', 'UNIDAD'),
(30, 29, 'C02.4.1', 'Amenidades de Baño (Privado o compartido)', 'UNIDAD'),
(31, 29, 'C02.4.2', 'Baño Adaptado a personas de movilidad reducida (Privado o compartido)', 'UNIDAD'),
(32, 29, 'C02.4.4', 'Amenidades en Cocina (Privada o compartida)', 'UNIDAD'),
(33, NULL, 'C03', 'EQUIPAMIENTO E INFRAESTRUCTURA DE LA PROPIEDAD (HOTELES/CASAS/BARCOS)', 'ESTABLECIMIENTO'),
(34, 33, 'C03.1', 'Bienestar, Salud y Relax', 'ESTABLECIMIENTO'),
(35, 33, 'C03.2', 'Ocio y Espacios Sociales', 'ESTABLECIMIENTO'),
(36, 33, 'C03.3', 'Infraestructuras de Negocios y Eventos', 'ESTABLECIMIENTO'),
(37, 33, 'C03.4', 'Abastecimiento y energía', 'ESTABLECIMIENTO'),
(38, NULL, 'C04', 'SERVICIOS DE LA PROPIEDAD Y EXPERIENCIAS', 'ESTABLECIMIENTO'),
(39, 38, 'C04.1', 'Atención al Cliente', 'ESTABLECIMIENTO'),
(40, 38, 'C04.2', 'Atención Multilingüe', 'ESTABLECIMIENTO'),
(41, 38, 'C04.3', 'Hostelería interna', 'ESTABLECIMIENTO'),
(42, 38, 'C04.4', 'Mantenimiento habitaciones y limpieza de ropa', 'ESTABLECIMIENTO'),
(43, 38, 'C04.5', 'Conexión a Internet', 'ESTABLECIMIENTO'),
(44, 38, 'C04.6', 'Movilidad y Transporte', 'ESTABLECIMIENTO'),
(45, 38, 'C04.7', 'Actividades y Entretenimiento Organizado (Experiencias en alrededores)', 'ESTABLECIMIENTO'),
(46, NULL, 'C05', 'ACCESIBILIDAD Y SEGURIDAD DE LA PROPIEDAD', 'ESTABLECIMIENTO'),
(47, 46, 'C05.1', 'Accesibilidad e Inclusión (Adaptabilidad)', 'ESTABLECIMIENTO'),
(48, 46, 'C05.2', 'Seguridad y Protección', 'ESTABLECIMIENTO'),
(49, NULL, 'C06', 'POLÍTICAS Y NORMAS DE LA PROPIEDAD', 'ESTABLECIMIENTO'),
(50, 49, 'C06.1', 'Horarios, Check-In, Check-Out y documentación', 'ESTABLECIMIENTO'),
(51, 49, 'C06.2', 'Mascotas', 'ESTABLECIMIENTO'),
(52, 49, 'C06.3', 'Perfil de Huésped', 'ESTABLECIMIENTO'),
(53, 49, 'C06.4', 'Tabaco y Fiestas', 'ESTABLECIMIENTO'),
(54, 49, 'C06.5', 'Políticas Especiales (sólo para algunos establecimientos)', 'ESTABLECIMIENTO'),
(55, 49, 'C06.6', 'Régimen de Estancia', 'ESTABLECIMIENTO'),
(56, 49, 'C06.7', 'Métodos y Plataformas de Pago Aceptadas en Venezuela', 'ESTABLECIMIENTO'),
(57, 56, 'C06.7.1', 'Pago Electrónico Local (Bolívares - VES)', 'ESTABLECIMIENTO'),
(58, 56, 'C06.7.2', 'Efectivo / Cash', 'ESTABLECIMIENTO'),
(59, 56, 'C06.7.3', 'Transferencias en Divisas / Billeteras Internacionales', 'ESTABLECIMIENTO'),
(60, 49, 'C06.8', 'Métodos y Plataformas de Pago Aceptadas en España', 'ESTABLECIMIENTO'),
(61, 49, 'C06.9', 'Condiciones de la reserva', 'ESTABLECIMIENTO'),
(62, 49, 'C06.10', 'Condiciones para estancia de niños', 'ESTABLECIMIENTO'),
(63, NULL, 'C07', 'INSTALACIONES Y SERVICIOS ESPECÍFICOS PARA PROPIEDADES TIPO "Agrupación de unidades habitacionales"', 'AMBOS'),
(64, NULL, 'C08', 'INSTALACIONES Y SERVICIOS ESPECÍFICOS PARA LOVE HOTELS', 'AMBOS'),
(65, 64, 'C08.1', 'Descanso y Mobiliario Erótico', 'UNIDAD'),
(66, 64, 'C08.2', 'Baño Privado y Zona de Agua en Love Hotels', 'UNIDAD'),
(67, 64, 'C08.3', 'Climatización y Ambientación en Love Hotels', 'UNIDAD'),
(68, 64, 'C08.4', 'Acceso e Infraestructura de Privacidad en Love Hotels', 'ESTABLECIMIENTO'),
(69, NULL, 'C09', 'INSTALACIONES Y SERVICIOS ESPECÍFICOS PARA CASAS Y CHALETS DE MONTAÑA (ESQUÍ)', 'AMBOS'),
(70, 69, 'C09.1', 'Descanso y Confort Térmico en Montaña', 'UNIDAD'),
(71, 69, 'C09.2', 'Cocina y Menaje de Montaña', 'UNIDAD'),
(72, 69, 'C09.3', 'Climatización y Suministros especiales para Montaña', 'UNIDAD'),
(73, 69, 'C09.4', 'Exteriores Privados en Montaña', 'UNIDAD'),
(74, 69, 'C09.5', 'Instalaciones Específicas de Esquí y Montaña', 'UNIDAD'),
(75, 69, 'C09.6', 'Servicios de Atención y Transporte en Montaña', 'ESTABLECIMIENTO'),
(76, 69, 'C09.7', 'Hostelería / Catering de Montaña', 'ESTABLECIMIENTO'),
(77, 69, 'C09.8', 'Actividades Organizadas de Montaña', 'ESTABLECIMIENTO'),
(78, NULL, 'C10', 'INSTALACIONES Y SERVICIOS ESPECÍFICOS PARA BARCOS CON ALOJAMIENTO ESTÁTICO EN PUERTO', 'AMBOS'),
(79, NULL, 'C11', 'INSTALACIONES Y SERVICIOS ESPECÍFICOS PARA BARCOS CON ALOJAMIENTO Y NAVEGACIÓN DIARIA INCLUIDA', 'AMBOS'),
(80, 79, 'C11.1', 'Equipamiento de Camarotes y Espacios Interiores', 'UNIDAD'),
(81, 79, 'C11.2', 'Cubierta y Zonas Exteriores', 'UNIDAD'),
(82, 79, 'C11.3', 'Zonas Comunes e Instalaciones en Barco', 'ESTABLECIMIENTO'),
(83, 79, 'C11.4', 'Prestaciones Náuticas', 'ESTABLECIMIENTO'),
(84, 79, 'C11.5', 'Medidas de Seguridad Marítima', 'ESTABLECIMIENTO'),
(85, 79, 'C11.6', 'Normas del Barco', 'ESTABLECIMIENTO'),
(86, 79, 'C11.7', 'Combustible de Barco', 'ESTABLECIMIENTO')
ON CONFLICT (id) DO UPDATE SET 
    parent_id = EXCLUDED.parent_id,
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    scope = EXCLUDED.scope;
