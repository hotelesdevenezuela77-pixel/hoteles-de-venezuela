-- =============================================================================
-- V2 ENTERPRISE HOSPITALITY OPERATIONS ENGINE: DDL, RLS & RPC MIGRATION
-- Hoteles de Venezuela SaaS Architecture
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. TABLE DEFINITION: hotel_spaces (Read Projection & Master Inventory)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hotel_spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id INT NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'room', -- 'room', 'glamping', 'villa', 'common_area', 'facility'
  building_floor VARCHAR(50) DEFAULT 'Piso 1',
  occupancy_status VARCHAR(30) NOT NULL DEFAULT 'vacant', -- 'vacant', 'occupied', 'reserved', 'out_of_order'
  cleaning_status VARCHAR(30) NOT NULL DEFAULT 'clean',   -- 'dirty', 'in_progress', 'touch_up_required', 'clean', 'inspected', 'out_of_service'
  maintenance_status VARCHAR(30) NOT NULL DEFAULT 'operational', -- 'operational', 'minor_issue', 'critical_lock'
  last_cleaned_at TIMESTAMPTZ,
  last_inspected_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uk_space_code_per_establishment UNIQUE (establishment_id, code)
);

-- -----------------------------------------------------------------------------
-- 2. TABLE DEFINITION: custom_field_definitions (No-Code Schema Registry)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS custom_field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id INT NOT NULL,
  target_entity VARCHAR(50) NOT NULL, -- 'task', 'space', 'maintenance_ticket', 'inspection'
  field_name VARCHAR(100) NOT NULL,
  field_key VARCHAR(100) NOT NULL,
  field_type VARCHAR(30) NOT NULL DEFAULT 'text', -- 'text', 'number', 'select', 'boolean', 'photo', 'signature', 'date', 'currency', 'formula'
  options JSONB DEFAULT '[]'::jsonb,
  is_required BOOLEAN DEFAULT FALSE,
  validation_rules JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uk_field_key_per_entity UNIQUE (establishment_id, target_entity, field_key)
);

-- -----------------------------------------------------------------------------
-- 3. TABLE DEFINITION: hotel_operational_tasks (Work Orders & Inspections)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hotel_operational_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id INT NOT NULL,
  space_id UUID REFERENCES hotel_spaces(id) ON DELETE SET NULL,
  space_code VARCHAR(50),
  reservation_id VARCHAR(100),
  category VARCHAR(50) NOT NULL DEFAULT 'housekeeping', -- 'housekeeping', 'maintenance', 'inspection', 'minibar'
  task_type VARCHAR(50) NOT NULL DEFAULT 'turnover_clean',
  title VARCHAR(200) NOT NULL,
  description TEXT,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical_blocking'
  status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'inspected', 'completed', 'cancelled'
  assigned_to_user_id UUID,
  assigned_staff_name VARCHAR(150),
  estimated_minutes INT DEFAULT 30,
  checklist_schema JSONB DEFAULT '[]'::jsonb,
  checklist_responses JSONB DEFAULT '{}'::jsonb,
  custom_values JSONB DEFAULT '{}'::jsonb, -- Indexed via GIN jsonb_path_ops
  photo_urls JSONB DEFAULT '[]'::jsonb,
  digital_signature_url TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. TABLE DEFINITION: hotel_operational_events (Immutable Event Store)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hotel_operational_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id INT NOT NULL,
  space_id UUID REFERENCES hotel_spaces(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL, -- 'ROOM_STATE_TRANSITION', 'CHECK_OUT_TRIGGER', 'CRITICAL_LOCKOUT', 'DEAD_MAN_DOWNGRADE'
  actor_id UUID,
  actor_name VARCHAR(150) NOT NULL DEFAULT 'SYSTEM_FSM',
  previous_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  new_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  payload JSONB DEFAULT '{}'::jsonb,
  correlation_id UUID DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 5. INDEXING STRATEGY (GIN jsonb_path_ops & Composite Indexes)
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_spaces_est_code ON hotel_spaces(establishment_id, code);
CREATE INDEX IF NOT EXISTS idx_spaces_status ON hotel_spaces(establishment_id, cleaning_status, maintenance_status);

-- GIN Index with jsonb_path_ops for high-performance JSONB field querying
CREATE INDEX IF NOT EXISTS idx_tasks_custom_values_path_ops ON hotel_operational_tasks USING GIN (custom_values jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_tasks_est_status ON hotel_operational_tasks(establishment_id, status);

-- Immutable Event Store Indexes
CREATE INDEX IF NOT EXISTS idx_events_est_space ON hotel_operational_events(establishment_id, space_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_correlation ON hotel_operational_events(correlation_id);

-- -----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES BY TENANT CONTEXT
-- -----------------------------------------------------------------------------
ALTER TABLE hotel_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_operational_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_operational_events ENABLE ROW LEVEL SECURITY;

-- RLS Policy: hotel_spaces
CREATE POLICY rls_hotel_spaces ON hotel_spaces
  FOR ALL
  USING (
    establishment_id = NULLIF(current_setting('app.current_establishment_id', true), '')::int
    OR current_setting('app.current_establishment_id', true) IS NULL
  );

-- RLS Policy: custom_field_definitions
CREATE POLICY rls_custom_field_definitions ON custom_field_definitions
  FOR ALL
  USING (
    establishment_id = NULLIF(current_setting('app.current_establishment_id', true), '')::int
    OR current_setting('app.current_establishment_id', true) IS NULL
  );

-- RLS Policy: hotel_operational_tasks
CREATE POLICY rls_hotel_operational_tasks ON hotel_operational_tasks
  FOR ALL
  USING (
    establishment_id = NULLIF(current_setting('app.current_establishment_id', true), '')::int
    OR current_setting('app.current_establishment_id', true) IS NULL
  );

-- RLS Policy: hotel_operational_events
CREATE POLICY rls_hotel_operational_events ON hotel_operational_events
  FOR ALL
  USING (
    establishment_id = NULLIF(current_setting('app.current_establishment_id', true), '')::int
    OR current_setting('app.current_establishment_id', true) IS NULL
  );

-- -----------------------------------------------------------------------------
-- 7. RPC ATOMIC FUNCTION: lock_room_and_cancel_availability
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION lock_room_and_cancel_availability(
  p_space_id UUID,
  p_reason TEXT,
  p_actor_name TEXT DEFAULT 'SYSTEM_RPC'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_establishment_id INT;
  v_space_code VARCHAR(50);
  v_prev_cleaning VARCHAR(30);
  v_prev_maint VARCHAR(30);
  v_prev_occ VARCHAR(30);
  v_event_id UUID;
BEGIN
  -- 1. Fetch and Lock the Target Room Space
  SELECT establishment_id, code, cleaning_status, maintenance_status, occupancy_status
  INTO v_establishment_id, v_space_code, v_prev_cleaning, v_prev_maint, v_prev_occ
  FROM hotel_spaces
  WHERE id = p_space_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Space with ID % does not exist.', p_space_id;
  END IF;

  -- 2. Atomically Update Space to Out of Order (OOO)
  UPDATE hotel_spaces
  SET 
    maintenance_status = 'critical_lock',
    cleaning_status = 'out_of_service',
    occupancy_status = 'out_of_order',
    updated_at = NOW()
  WHERE id = p_space_id;

  -- 3. Emit Immutable Event
  INSERT INTO hotel_operational_events (
    establishment_id,
    space_id,
    event_type,
    actor_name,
    previous_state,
    new_state,
    payload
  ) VALUES (
    v_establishment_id,
    p_space_id,
    'CRITICAL_LOCKOUT_OUT_OF_ORDER',
    p_actor_name,
    jsonb_build_object('cleaning_status', v_prev_cleaning, 'maintenance_status', v_prev_maint, 'occupancy_status', v_prev_occ),
    jsonb_build_object('cleaning_status', 'out_of_service', 'maintenance_status', 'critical_lock', 'occupancy_status', 'out_of_order'),
    jsonb_build_object('reason', p_reason, 'space_code', v_space_code)
  ) RETURNING id INTO v_event_id;

  -- 4. Return Atomic Transaction Result
  RETURN jsonb_build_object(
    'success', true,
    'space_id', p_space_id,
    'space_code', v_space_code,
    'event_id', v_event_id,
    'status', 'out_of_order',
    'timestamp', NOW()
  );
END;
$$;
