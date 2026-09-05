-- Migration: Schema para Complejos Turísticos, Parques Acuáticos y Centros de Recreación
-- Plataforma: Hoteles de Venezuela (Caso El Mundo de los Niños)

-- 1. Tabla de Tickets / Pases de Entrada
CREATE TABLE IF NOT EXISTS park_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id BIGINT NOT NULL,
    ticket_code TEXT NOT NULL UNIQUE,
    guest_name TEXT NOT NULL,
    guest_email TEXT,
    guest_phone TEXT,
    adults_count INT NOT NULL DEFAULT 1,
    children_count INT NOT NULL DEFAULT 0,
    has_boat_ride BOOLEAN DEFAULT FALSE,
    has_food_package BOOLEAN DEFAULT FALSE,
    vip_access BOOLEAN DEFAULT FALSE,
    purchase_source TEXT NOT NULL CHECK (purchase_source IN ('web', 'taquilla')),
    price_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
    price_bs NUMERIC(12,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('valid', 'used', 'cancelled')) DEFAULT 'valid',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    used_at TIMESTAMPTZ,
    used_by_staff TEXT
);

CREATE INDEX IF NOT EXISTS idx_park_tickets_code ON park_tickets(LOWER(ticket_code));
CREATE INDEX IF NOT EXISTS idx_park_tickets_est ON park_tickets(establishment_id);

-- 2. Tabla de Aforo y Capacidad del Parque
CREATE TABLE IF NOT EXISTS park_capacity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id BIGINT UNIQUE NOT NULL,
    max_capacity INT NOT NULL DEFAULT 3500,
    current_adults INT NOT NULL DEFAULT 0,
    current_children INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Monitor de Piscinas
CREATE TABLE IF NOT EXISTS park_pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id BIGINT NOT NULL,
    pool_code TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('open', 'closed', 'maintenance')) DEFAULT 'open',
    bathers_count INT NOT NULL DEFAULT 0,
    max_capacity INT NOT NULL DEFAULT 300,
    saturation_level TEXT NOT NULL CHECK (saturation_level IN ('low', 'medium', 'high', 'full')) DEFAULT 'low',
    lifeguard_name TEXT DEFAULT 'Sin Asignar',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Flota de Botes (Lago Náutico)
CREATE TABLE IF NOT EXISTS park_boats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id BIGINT NOT NULL,
    boat_code TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('docked', 'sailing', 'maintenance')) DEFAULT 'docked',
    max_capacity INT NOT NULL DEFAULT 4,
    passengers_count INT NOT NULL DEFAULT 0,
    lifejackets_in_use INT NOT NULL DEFAULT 0,
    departure_time TIMESTAMPTZ,
    expected_return_time TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de Comandas de Alimentos & Bebidas
CREATE TABLE IF NOT EXISTS park_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id BIGINT NOT NULL,
    order_number TEXT NOT NULL,
    location_type TEXT NOT NULL CHECK (location_type IN ('mesa', 'kiosco', 'toldo', 'choza')),
    location_identifier TEXT NOT NULL,
    customer_name TEXT DEFAULT 'Visitante',
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_bs NUMERIC(12,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('pending', 'preparing', 'delivered', 'paid')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabla de Gastos Operativos Inmediatos
CREATE TABLE IF NOT EXISTS park_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id BIGINT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('cloro_quimicos', 'combustible_botes', 'insumos_cocina', 'reparaciones', 'caja_chica', 'otro')),
    description TEXT NOT NULL,
    amount_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
    amount_bs NUMERIC(12,2) NOT NULL DEFAULT 0,
    receipt_url TEXT,
    logged_by TEXT DEFAULT 'Administración',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Función RPC Atómica de Validación Anti-Fraude
CREATE OR REPLACE FUNCTION validate_and_redeem_park_ticket(
    p_ticket_code TEXT,
    p_establishment_id BIGINT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_ticket RECORD;
BEGIN
    -- Bloqueo atómico a nivel de fila FOR UPDATE
    SELECT * INTO v_ticket
    FROM park_tickets
    WHERE LOWER(ticket_code) = LOWER(p_ticket_code)
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'NOT_FOUND',
            'message', '¡TICKET NO ENCONTRADO! El código QR no corresponde a ningún pase emitido.'
        );
    END IF;

    IF v_ticket.status = 'used' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'ALREADY_USED',
            'message', '¡ALERTA ANTIFRAUDE! Este ticket ya fue canjeado en la taquilla.',
            'used_at', v_ticket.used_at,
            'ticket', row_to_json(v_ticket)
        );
    END IF;

    IF v_ticket.status = 'cancelled' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'CANCELLED',
            'message', '¡ALERTA! Este ticket fue anulado por la administración.',
            'ticket', row_to_json(v_ticket)
        );
    END IF;

    -- Actualizar estado a USADO
    UPDATE park_tickets
    SET status = 'used',
        used_at = NOW()
    WHERE id = v_ticket.id;

    -- Incrementar aforo general en tiempo real
    INSERT INTO park_capacity (establishment_id, max_capacity, current_adults, current_children, updated_at)
    VALUES (COALESCE(p_establishment_id, v_ticket.establishment_id), 3500, COALESCE(v_ticket.adults_count, 1), COALESCE(v_ticket.children_count, 0), NOW())
    ON CONFLICT (establishment_id)
    DO UPDATE SET
        current_adults = park_capacity.current_adults + COALESCE(v_ticket.adults_count, 1),
        current_children = park_capacity.current_children + COALESCE(v_ticket.children_count, 0),
        updated_at = NOW();

    RETURN jsonb_build_object(
        'success', true,
        'message', '¡PASE VALIDADO EXITOSAMENTE! Entradas autorizadas.',
        'ticket', jsonb_build_object(
            'id', v_ticket.id,
            'ticket_code', v_ticket.ticket_code,
            'guest_name', v_ticket.guest_name,
            'adults_count', v_ticket.adults_count,
            'children_count', v_ticket.children_count,
            'has_boat_ride', v_ticket.has_boat_ride,
            'has_food_package', v_ticket.has_food_package,
            'vip_access', v_ticket.vip_access,
            'purchase_source', v_ticket.purchase_source,
            'status', 'used',
            'used_at', NOW()
        )
    );
END;
$$;

-- RLS Policies
ALTER TABLE park_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE park_capacity ENABLE ROW LEVEL SECURITY;
ALTER TABLE park_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE park_boats ENABLE ROW LEVEL SECURITY;
ALTER TABLE park_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE park_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read and write to park_tickets" ON park_tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated read and write to park_capacity" ON park_capacity FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated read and write to park_pools" ON park_pools FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated read and write to park_boats" ON park_boats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated read and write to park_orders" ON park_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated read and write to park_expenses" ON park_expenses FOR ALL USING (true) WITH CHECK (true);
