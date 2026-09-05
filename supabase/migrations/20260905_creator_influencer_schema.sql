-- Migración SQL: Esquema para Creadores de Contenido de Turismo, Influencers y Exploradores (Desk Hub)
-- Plataforma: Hoteles de Venezuela

-- 1. Tabla de Expediciones / Rutas Realizadas
CREATE TABLE IF NOT EXISTS creator_expeditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id BIGINT NOT NULL,
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    km_distance NUMERIC(10,2) NOT NULL DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_budget_usd NUMERIC(10,2) DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'archived')) DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Coordenadas GPS & Waypoints
CREATE TABLE IF NOT EXISTS creator_waypoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expedition_id UUID REFERENCES creator_expeditions(id) ON DELETE CASCADE,
    latitude NUMERIC(10,6) NOT NULL,
    longitude NUMERIC(10,6) NOT NULL,
    altitude_meters NUMERIC(8,2) DEFAULT 0,
    point_type TEXT NOT NULL CHECK (point_type IN ('spot_fotografico', 'gasolinera', 'mirador', 'posada', 'restaurante', 'alerta_vial', 'sendero_offroad')),
    title TEXT NOT NULL,
    description TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Acuerdos Comerciales & Canjes (Brand Deals & Media Kit)
CREATE TABLE IF NOT EXISTS creator_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id BIGINT NOT NULL,
    brand_name TEXT NOT NULL,
    deal_type TEXT NOT NULL CHECK (deal_type IN ('monetario', 'canje', 'mixto')),
    monetary_usd NUMERIC(10,2) DEFAULT 0,
    barter_value_usd NUMERIC(10,2) DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('pautado', 'en_produccion', 'por_cobrar', 'liquidado')) DEFAULT 'en_produccion',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Entregables por Contrato
CREATE TABLE IF NOT EXISTS creator_deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES creator_deals(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('instagram_reel', 'tiktok', 'instagram_stories', 'hdv_review', 'youtube_video', 'blog_article')),
    due_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'delivered')) DEFAULT 'pending',
    link_url TEXT
);

-- 5. Tabla de Gastos de Carretera / Expedición
CREATE TABLE IF NOT EXISTS creator_route_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id BIGINT NOT NULL,
    expedition_id UUID REFERENCES creator_expeditions(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('combustible', 'peajes', 'lancheros', 'comidas', 'reparaciones', 'propinas', 'otros')),
    amount_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
    amount_bs NUMERIC(12,2) NOT NULL DEFAULT 0,
    logged_by TEXT DEFAULT 'Creador de Viajes',
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabla de Calendario Editorial & Tareas Drag-and-Drop
CREATE TABLE IF NOT EXISTS creator_editorial_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id BIGINT NOT NULL,
    task_name TEXT NOT NULL,
    platform TEXT NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('todo', 'editing', 'review', 'published')) DEFAULT 'todo',
    position_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabla de Auditorías Técnicas a Establecimientos Visitados
CREATE TABLE IF NOT EXISTS creator_establishment_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id BIGINT NOT NULL,
    visited_establishment_name TEXT NOT NULL,
    wifi_speed_mbps NUMERIC(6,2) DEFAULT 0,
    water_pressure_status TEXT CHECK (water_pressure_status IN ('excelente', 'aceptable', 'deficiente')) DEFAULT 'excelente',
    power_generator_status TEXT CHECK (power_generator_status IN ('si_automatica', 'si_manual', 'no_tiene')) DEFAULT 'si_automatica',
    water_well_status TEXT CHECK (water_well_status IN ('si_pozo_propio', 'tanque_reserva', 'no_tiene')) DEFAULT 'si_pozo_propio',
    overall_score NUMERIC(3,1) CHECK (overall_score >= 1.0 AND overall_score <= 10.0) DEFAULT 9.0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices para optimización de consultas
CREATE INDEX IF NOT EXISTS idx_creator_expeditions_est ON creator_expeditions(establishment_id);
CREATE INDEX IF NOT EXISTS idx_creator_deals_est ON creator_deals(establishment_id);
CREATE INDEX IF NOT EXISTS idx_creator_tasks_est ON creator_editorial_tasks(establishment_id);

-- RLS Policies
ALTER TABLE creator_expeditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_waypoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_route_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_editorial_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_establishment_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated full access to creator_expeditions" ON creator_expeditions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access to creator_waypoints" ON creator_waypoints FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access to creator_deals" ON creator_deals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access to creator_deliverables" ON creator_deliverables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access to creator_route_expenses" ON creator_route_expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access to creator_editorial_tasks" ON creator_editorial_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access to creator_establishment_audits" ON creator_establishment_audits FOR ALL USING (true) WITH CHECK (true);
