-- Hoteles de Venezuela - Script de Migración para Páginas Personalizadas
-- Ejecuta este script en el SQL Editor de tu panel de control de Supabase.

-- 1. Agregar columnas adicionales a custom_pages
ALTER TABLE custom_pages ADD COLUMN IF NOT EXISTS meta_keywords TEXT;
ALTER TABLE custom_pages ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE custom_pages ADD COLUMN IF NOT EXISTS gallery_images TEXT;
ALTER TABLE custom_pages ADD COLUMN IF NOT EXISTS related_establishments TEXT;

-- Comentario para verificar que las columnas fueron agregadas con éxito
COMMENT ON TABLE custom_pages IS 'Tabla para páginas personalizadas con soporte para SEO, galerías, videos y recomendaciones';
