-- Migración SQL: Esquema para Agencias de Viajes, Tour Operadores y DMCs (Destination Management Companies)
-- Plataforma: Hoteles de Venezuela

-- 1. Tabla de Paquetes Turísticos Ensamblados
CREATE TABLE IF NOT EXISTS agency_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id BIGINT NOT NULL,
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    duration_days INT NOT NULL DEFAULT 3,
    duration_nights INT NOT NULL DEFAULT 2,
    net_cost_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
    markup_percentage NUMERIC(5,2) NOT NULL DEFAULT 20.00,
    price_per_person_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
    price_per_person_bs NUMERIC(12,2) NOT NULL DEFAULT 0,
    min_passengers INT NOT NULL DEFAULT 1,
    inclusions JSONB NOT NULL DEFAULT '[]'::jsonb,
    exclusions JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL CHECK (status IN ('active', 'draft', 'archived')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Servicios Desglosados por Paquete (Proveedores B2B)
CREATE TABLE IF NOT EXISTS agency_package_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID REFERENCES agency_packages(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL CHECK (service_type IN ('hospedaje', 'transporte_terrestre', 'lancha_maritimo', 'vuelo_charter', 'guia', 'alimentacion', 'entradas_parque')),
    provider_name TEXT NOT NULL,
    description TEXT NOT NULL,
    net_cost_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Cotizaciones & Reservaciones de Clientes
CREATE TABLE IF NOT EXISTS agency_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id BIGINT NOT NULL,
    quote_number TEXT NOT NULL UNIQUE,
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_phone TEXT NOT NULL,
    package_id UUID REFERENCES agency_packages(id) ON DELETE SET NULL,
    package_title TEXT NOT NULL,
    travel_start_date DATE NOT NULL,
    travel_end_date DATE NOT NULL,
    adults_count INT NOT NULL DEFAULT 2,
    children_count INT NOT NULL DEFAULT 0,
    total_sale_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_sale_bs NUMERIC(12,2) NOT NULL DEFAULT 0,
    deposit_paid_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
    remaining_balance_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
    payment_deadline TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('draft', 'confirmed', 'paid_in_full', 'completed', 'cancelled')) DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Manifiesto de Pasajeros & Rooming List
CREATE TABLE IF NOT EXISTS agency_passengers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID REFERENCES agency_quotes(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    document_type TEXT NOT NULL DEFAULT 'cedula',
    document_number TEXT NOT NULL,
    birth_date DATE,
    nationality TEXT DEFAULT 'Venezolana',
    dietary_restrictions TEXT DEFAULT 'Ninguna',
    medical_conditions TEXT DEFAULT 'Ninguna',
    emergency_contact TEXT
);

-- 5. Tabla de Itinerarios Día por Día
CREATE TABLE IF NOT EXISTS agency_itineraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID REFERENCES agency_quotes(id) ON DELETE CASCADE,
    day_number INT NOT NULL,
    time_schedule TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location_name TEXT,
    outfit_recommendations TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabla de Cuentas por Pagar y Liquidación a Proveedores B2B
CREATE TABLE IF NOT EXISTS agency_supplier_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id BIGINT NOT NULL,
    quote_id UUID REFERENCES agency_quotes(id) ON DELETE CASCADE,
    provider_name TEXT NOT NULL,
    service_category TEXT NOT NULL CHECK (service_category IN ('posada_hotel', 'transporte', 'lanchero', 'guia', 'restaurante', 'charter')),
    amount_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
    amount_bs NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_deadline DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'paid')) DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    bank_reference TEXT,
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabla de Gastos Operativos por Expedición
CREATE TABLE IF NOT EXISTS agency_expedition_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id BIGINT NOT NULL,
    quote_id UUID REFERENCES agency_quotes(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('combustible', 'propinas', 'entradas_parques', 'snacks_hidratacion', 'peajes', 'imprevistos')),
    amount_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
    amount_bs NUMERIC(12,2) NOT NULL DEFAULT 0,
    logged_by TEXT DEFAULT 'Agente de Operaciones',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices para búsquedas veloces
CREATE INDEX IF NOT EXISTS idx_agency_quotes_est ON agency_quotes(establishment_id);
CREATE INDEX IF NOT EXISTS idx_agency_packages_est ON agency_packages(establishment_id);
CREATE INDEX IF NOT EXISTS idx_agency_supplier_payments_est ON agency_supplier_payments(establishment_id);

-- RLS Policies
ALTER TABLE agency_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_package_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_supplier_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_expedition_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated full access to agency_packages" ON agency_packages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access to agency_package_services" ON agency_package_services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access to agency_quotes" ON agency_quotes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access to agency_passengers" ON agency_passengers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access to agency_itineraries" ON agency_itineraries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access to agency_supplier_payments" ON agency_supplier_payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access to agency_expedition_expenses" ON agency_expedition_expenses FOR ALL USING (true) WITH CHECK (true);
