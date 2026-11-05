-- =============================================================================
-- MIGRACIÓN OFICIAL V15: PANEL DE CONFIGURACIÓN DE LA PROPIEDAD & FICHA DETALLE
-- Arquitectura PostgreSQL + JSONB Nativo (Hoteles de Venezuela)
-- =============================================================================

-- 1. Columnas de clasificación taxonómica V15 y campos JSONB nativos en `establishments`
ALTER TABLE IF EXISTS public.establishments
  ADD COLUMN IF NOT EXISTS country_category_id integer DEFAULT 1, -- 1 = Venezuela (VE), 2 = España (ES)
  ADD COLUMN IF NOT EXISTS service_category_id integer DEFAULT 1, -- 1..9 (CS-01..CS-09)
  ADD COLUMN IF NOT EXISTS subcategory_id integer DEFAULT 1,      -- 1..42 (SCS-01..SCS-42)
  ADD COLUMN IF NOT EXISTS rooms_distribution jsonb DEFAULT '[]'::jsonb, -- Distribución de unidades C05 y C06 en JSONB
  ADD COLUMN IF NOT EXISTS v15_tags_values jsonb DEFAULT '{}'::jsonb,    -- Mapa de valores de las 509 etiquetas V15
  ADD COLUMN IF NOT EXISTS points_of_interest jsonb DEFAULT '[]'::jsonb, -- Lugares cercanos C00.6.1, C00.6.2, C00.6.3
  ADD COLUMN IF NOT EXISTS v15_wizard_state jsonb DEFAULT '{}'::jsonb;   -- Estado de progreso por pasos del Wizard V15

-- 2. Índices GIN de alto rendimiento sobre las columnas JSONB para filtrado B2C instantáneo
CREATE INDEX IF NOT EXISTS idx_establishments_rooms_distribution_gin
  ON public.establishments USING gin (rooms_distribution);

CREATE INDEX IF NOT EXISTS idx_establishments_v15_tags_values_gin
  ON public.establishments USING gin (v15_tags_values);

-- 3. Tabla Pivote 1: `subcategory_parents` (Relación N:M entre Complejos CS-02 y Unidades Hijas SCS-17..30)
CREATE TABLE IF NOT EXISTS public.subcategory_parents (
  parent_id integer NOT NULL,
  child_subcategory_id integer NOT NULL,
  description text,
  PRIMARY KEY (parent_id, child_subcategory_id)
);

-- 4. Función de purga de términos obsoletos (CADIVI / COVID-19) en notas legales
CREATE OR REPLACE FUNCTION public.sanitize_v15_legal_text(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF input_text IS NULL THEN
    RETURN '';
  END IF;
  RETURN regexp_replace(
    input_text,
    '(cadivi|cencoex|covid-19|coronavirus|uso obligatorio de mascarilla)',
    '',
    'gi'
  );
END;
$$;

