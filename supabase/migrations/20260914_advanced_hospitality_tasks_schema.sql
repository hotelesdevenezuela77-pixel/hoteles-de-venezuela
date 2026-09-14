-- MIGRACIÓN DE DATOS: SISTEMA AVANZADO DE GESTIÓN DE TAREAS Y OPERACIONES HOTELLERAS
-- Hoteles de Venezuela SaaS Architecture

-- 1. ESPACIOS E INSTALACIONES DEL ESTABLECIMIENTO
CREATE TABLE IF NOT EXISTS hotel_spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id INT NOT NULL,
  code VARCHAR(50) NOT NULL, -- Ej: HAB-301, PISCINA-A, SUITE-PRESIDENCIAL
  name VARCHAR(150) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'room', -- 'room', 'glamping', 'villa', 'common_area', 'facility'
  building_floor VARCHAR(50) DEFAULT 'Piso 1',
  occupancy_status VARCHAR(30) DEFAULT 'vacant', -- 'vacant', 'occupied', 'reserved', 'out_of_order'
  cleaning_status VARCHAR(30) DEFAULT 'clean', -- 'dirty', 'in_progress', 'clean', 'inspected', 'out_of_service'
  maintenance_status VARCHAR(30) DEFAULT 'operational', -- 'operational', 'minor_issue', 'critical_lock'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MOTOR DE CAMPOS PERSONALIZADOS (NO-CODE BUILDER)
CREATE TABLE IF NOT EXISTS custom_field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id INT NOT NULL,
  target_entity VARCHAR(50) NOT NULL, -- 'task', 'space', 'maintenance_ticket', 'inspection'
  field_name VARCHAR(100) NOT NULL,
  field_key VARCHAR(100) NOT NULL,
  field_type VARCHAR(30) NOT NULL DEFAULT 'text', -- 'text', 'number', 'select', 'boolean', 'photo', 'signature', 'date', 'currency', 'formula'
  options JSONB DEFAULT '[]'::jsonb, -- Array de opciones para selects o checkboxes
  is_required BOOLEAN DEFAULT FALSE,
  validation_rules JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TAREAS Y ORDENES OPERATIVAS (HOUSEKEEPING & GENERAL)
CREATE TABLE IF NOT EXISTS hotel_operational_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id INT NOT NULL,
  space_id UUID REFERENCES hotel_spaces(id) ON DELETE SET NULL,
  space_code VARCHAR(50),
  reservation_id VARCHAR(100),
  category VARCHAR(50) NOT NULL DEFAULT 'housekeeping', -- 'housekeeping', 'maintenance', 'inspection', 'minibar', 'amenities'
  task_type VARCHAR(50) NOT NULL DEFAULT 'turnover_clean', -- 'turnover_clean', 'stayover_clean', 'deep_clean', 'preventive_maint', 'urgent_repair'
  title VARCHAR(200) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical_blocking'
  status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'in_progress', 'inspected', 'completed', 'cancelled'
  assigned_to_user_id UUID,
  assigned_staff_name VARCHAR(150),
  estimated_minutes INT DEFAULT 30,
  checklist_schema JSONB DEFAULT '[]'::jsonb,
  checklist_responses JSONB DEFAULT '{}'::jsonb,
  custom_values JSONB DEFAULT '{}'::jsonb,
  photo_urls JSONB DEFAULT '[]'::jsonb,
  digital_signature_url TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TICKETS DE MANTENIMIENTO E INSTALACIONES
CREATE TABLE IF NOT EXISTS hotel_maintenance_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id INT NOT NULL,
  space_id UUID REFERENCES hotel_spaces(id) ON DELETE CASCADE,
  space_code VARCHAR(50) NOT NULL,
  equipment_name VARCHAR(150),
  severity VARCHAR(30) NOT NULL DEFAULT 'moderate', -- 'minor', 'moderate', 'high', 'blocking_out_of_order'
  issue_type VARCHAR(100) NOT NULL, -- 'plumbing', 'electrical', 'hvac', 'masonry', 'pool_chemical'
  status VARCHAR(30) DEFAULT 'open', -- 'open', 'diagnosing', 'waiting_parts', 'resolved', 'closed'
  blocks_inventory BOOLEAN DEFAULT FALSE,
  reported_by VARCHAR(150),
  technician_assigned VARCHAR(150),
  repair_cost_usd NUMERIC(10,2) DEFAULT 0.00,
  attachments JSONB DEFAULT '[]'::jsonb,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDICES GIN PARA CONSULTA RÁPIDA DE JSONB
CREATE INDEX IF NOT EXISTS idx_hotel_operational_tasks_custom_values ON hotel_operational_tasks USING GIN (custom_values);
CREATE INDEX IF NOT EXISTS idx_hotel_spaces_establishment ON hotel_spaces(establishment_id);
CREATE INDEX IF NOT EXISTS idx_hotel_operational_tasks_establishment ON hotel_operational_tasks(establishment_id);
CREATE INDEX IF NOT EXISTS idx_hotel_maintenance_tickets_establishment ON hotel_maintenance_tickets(establishment_id);
