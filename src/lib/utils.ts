import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina nombres de clases condicionales de Tailwind CSS de forma segura,
 * resolviendo conflictos de clases de forma inteligente con tailwind-merge.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
