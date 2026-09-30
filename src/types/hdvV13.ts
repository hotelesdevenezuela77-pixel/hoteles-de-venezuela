/**
 * Especificación de Tipos de Arquitectura V13 - Hoteles de Venezuela
 * Catálogos C00 - C11 y Agrupación Dinámica de Dormitorios / Recámaras
 */

export type ScopeType = 'ESTABLECIMIENTO' | 'UNIDAD' | 'AMBOS';

export interface TagGroup {
  id: number;
  parent_id: number | null;
  code: string;
  name: string;
  scope: ScopeType;
}

export interface TagItem {
  id: number;
  tag_group_id: number;
  code: string;
  name: string;
  data_type: 'string' | 'integer' | 'boolean' | 'range' | 'json' | 'array';
  countries: string;
  allowed_subcategories: string;
  is_search_filter: boolean;
  search_weight: number;
}

/**
 * Modelo de Agrupación Flexible de Dormitorios / Recámaras (V13)
 * Soporta configuración unificada de recámaras con equipamiento idéntico
 * y desglose independiente de recámaras con equipamiento distinto.
 */
export interface BedDistribution {
  single_100?: number;      // C01.3.1: Individuales 100cm
  king_200?: number;        // C01.3.2: King Size 200cm
  queen_180?: number;       // C01.3.3: Queen Size 180cm
  full_150?: number;        // C01.3.4: Doble Full 150cm
  double_135?: number;      // C01.3.5: Doble 135cm
  bunk_90?: number;         // C01.3.6: Literas (2 camas 90cm)
}

export interface BedroomGroupConfig {
  group_id: string;                      // Identificador del grupo (ej. "grp_1_2")
  group_label: string;                   // Etiqueta legible (ej. "Dormitorios 1 y 2 (Mismo equipamiento)")
  bedroom_numbers: number[];             // Lista de dormitorios que componen el grupo (ej. [1, 2])
  size_m2?: number;                      // Tamaño en m2
  bath_type: 'private' | 'shared' | 'none'; // Baño privado o compartido
  bed_counts: BedDistribution;           // Configuración de camas del grupo
  tags: Record<string, boolean | string | number>; // Etiquetas de equipamiento aplicadas (C02.1.x, C02.3.x)
}

export interface UnitDistributionPayload {
  unit_name: string;
  unit_type: 'HOTEL_ROOM' | 'HOUSE' | 'APARTMENT' | 'CHALET' | 'BOAT' | 'COMPLEX_UNIT';
  total_bedrooms: number;
  total_private_bathrooms: number;
  total_shared_bathrooms: number;
  bedroom_groups: BedroomGroupConfig[];
  shared_spaces_tags?: Record<string, boolean | string | number>;
  unit_features?: Record<string, any>;
}
