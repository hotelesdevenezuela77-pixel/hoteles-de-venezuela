import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina nombres de clases condicionales de Tailwind CSS de forma segura,
 * resolviendo conflictos de clases de forma inteligente con tailwind-merge.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Optimiza la URL de una imagen (especialmente de Unsplash) para reducir su tamaño y acelerar la carga.
 * Si es una imagen de Unsplash, reemplaza o agrega los parámetros de ancho (w), calidad (q) y formato automático.
 */
export function optimizeImageUrl(url: string | null | undefined, width: number): string {
  const defaultImage = `https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=${width}&auto=format&fit=crop&q=80`;
  if (!url) return defaultImage;
  
  if (url.includes("unsplash.com")) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set("w", width.toString());
      urlObj.searchParams.set("auto", "format");
      urlObj.searchParams.set("q", "80");
      if (!urlObj.searchParams.has("fit")) {
        urlObj.searchParams.set("fit", "crop");
      }
      return urlObj.toString();
    } catch (e) {
      return url;
    }
  }
  return url;
}

