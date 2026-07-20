import { supabase } from "@/lib/supabase";

export interface FeaturedReview {
  id: number | string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  location_tag: string;
  comment: string;
  row_position: 1 | 2 | 3;
  created_at?: string;
}

export const DEFAULT_FEATURED_REVIEWS: FeaturedReview[] = [
  // FILA 1
  {
    id: "r1-1",
    user_name: "Mariana Silva",
    user_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    rating: 5,
    location_tag: "Posada Galápagos · Los Roques",
    comment: "Contactamos directamente a la posada desde la plataforma y nos ahorramos un 20% en comisiones de agencias. ¡La atención en Los Roques fue inolvidable!",
    row_position: 1
  },
  {
    id: "r1-2",
    user_name: "Carlos Mendoza",
    user_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    rating: 5,
    location_tag: "Hotel Eurobuilding · Caracas",
    comment: "La confirmación directa por WhatsApp con el gerente fue en menos de 5 minutos. La mejor guía de hospedajes en Venezuela sin duda.",
    row_position: 1
  },
  {
    id: "r1-3",
    user_name: "Elena Rivas",
    user_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    rating: 5,
    location_tag: "Cabañas Cubiro · Lara",
    comment: "Hermosa experiencia en las lomas de Cubiro. El mapa interactivo y el WhatsApp directo hicieron que organizar el viaje familiar fuera facilísimo.",
    row_position: 1
  },
  {
    id: "r1-4",
    user_name: "Guillermo Paredes",
    user_avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    rating: 5,
    location_tag: "Campamento Canaima · Bolívar",
    comment: "Nos dio muchísima tranquilidad saber que el campamento estaba auditado con el Sello de Verificación. Recomiendo totalmente Hoteles de Venezuela.",
    row_position: 1
  },
  // FILA 2
  {
    id: "r2-1",
    user_name: "Daniela Alarcón",
    user_avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
    rating: 5,
    location_tag: "Hotel Sabbia by LD · Margarita",
    comment: "Ubicación espectacular en Pampatar. Reservamos 4 noches directo con la recepción sin recargos. ¡Repetiremos pronto!",
    row_position: 2
  },
  {
    id: "r2-2",
    user_name: "Roberto Zabala",
    user_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    rating: 5,
    location_tag: "Posada La Ardileña · Morrocoy",
    comment: "La salida en lancha directo desde el embarcadero de la posada hacia Cayo Sombrero fue increíble. Excelente curaduría de sitios.",
    row_position: 2
  },
  {
    id: "r2-3",
    user_name: "Sofía Benítez",
    user_avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    rating: 5,
    location_tag: "Posada Casa Sol · Mérida",
    comment: "Frío andino, chocolate caliente y habitaciones espectaculares. Toda la información de la plataforma era 100% exacta.",
    row_position: 2
  },
  {
    id: "r2-4",
    user_name: "Andrés Colmenares",
    user_avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
    rating: 5,
    location_tag: "Cala Boutique Hotel · Margarita",
    comment: "La atención personalizada por WhatsApp nos resolvió todo el itinerario de vuelo y traslado. Una maravilla de servicio.",
    row_position: 2
  },
  // FILA 3
  {
    id: "r3-1",
    user_name: "Valeria Gutiérrez",
    user_avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150",
    rating: 5,
    location_tag: "Posada El Encanto · Colonia Tovar",
    comment: "Un fin de semana romántico perfecto. Cotizamos en vivo y la posada nos aceptó Pago Móvil y Zelle sin complicaciones.",
    row_position: 3
  },
  {
    id: "r3-2",
    user_name: "Fernando Machado",
    user_avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
    rating: 5,
    location_tag: "Hotel Lidotel · Valencia",
    comment: "Viaje de negocios impecable. Instalaciones impecables y piscina excelente. Es nuestra plataforma de referencia para viajar por Venezuela.",
    row_position: 3
  },
  {
    id: "r3-3",
    user_name: "Patricia Lugo",
    user_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    rating: 5,
    location_tag: "Posada Playa Azul · Choroní",
    comment: "Hermosa posada cerca del malecón de Puerto Colombia. Las imágenes y contactos de la web son totalmente reales y confiables.",
    row_position: 3
  },
  {
    id: "r3-4",
    user_name: "Jesús Enrique Morales",
    user_avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150",
    rating: 5,
    location_tag: "Hato Piñero · Los Llanos",
    comment: "Avistamiento de fauna silvestre único en Venezuela. Reservar por el canal directo oficial fue seguro y súper ágil.",
    row_position: 3
  }
];

const LOCAL_STORAGE_KEY = "hdv_featured_reviews_custom";

/**
 * Obtiene todas las reseñas destacadas del Home (combinando storage local e inicialización si no existen).
 */
export function getStoredFeaturedReviews(): FeaturedReview[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      // Si aún no se ha guardado nada en localStorage, inicializamos con las reseñas por defecto
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_FEATURED_REVIEWS));
      return DEFAULT_FEATURED_REVIEWS;
    }
    const parsed: FeaturedReview[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_FEATURED_REVIEWS));
      return DEFAULT_FEATURED_REVIEWS;
    }
    return parsed;
  } catch (err) {
    console.error("Error reading featured reviews from localStorage:", err);
    return DEFAULT_FEATURED_REVIEWS;
  }
}

/**
 * Carga reseñas desde Supabase si existen, o desde localStorage si no.
 */
export async function fetchAllFeaturedReviews(): Promise<FeaturedReview[]> {
  try {
    const { data, error } = await supabase
      .from("customer_reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      const mapped: FeaturedReview[] = data.map((r: any) => ({
        id: r.id,
        user_name: r.user_name || "Viajero",
        user_avatar: r.user_avatar || "",
        rating: Number(r.rating) || 5,
        location_tag: r.location_tag || "Venezuela",
        comment: r.comment || "",
        row_position: (Number(r.row_position) || 1) as 1 | 2 | 3,
        created_at: r.created_at
      }));
      // Guardar también en localStorage para sync
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mapped));
      return mapped;
    }
  } catch (e) {
    console.warn("Using local storage for featured reviews fallback");
  }

  return getStoredFeaturedReviews();
}

/**
 * Guarda o actualiza una reseña destacada en LocalStorage y Supabase.
 */
export async function saveFeaturedReview(review: FeaturedReview): Promise<FeaturedReview[]> {
  const currentList = getStoredFeaturedReviews();
  const index = currentList.findIndex(r => String(r.id) === String(review.id));

  let newList: FeaturedReview[];
  if (index >= 0) {
    newList = [...currentList];
    newList[index] = { ...newList[index], ...review };
  } else {
    newList = [review, ...currentList];
  }

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newList));

  // Intentar guardar en Supabase customer_reviews
  try {
    const dbPayload = {
      user_name: review.user_name,
      user_avatar: review.user_avatar || null,
      location_tag: review.location_tag,
      comment: review.comment,
      rating: review.rating,
      row_position: review.row_position
    };

    if (typeof review.id === "number" && review.id > 1000000) {
      // probable ID numérico existente o generado
      await supabase.from("customer_reviews").upsert({ id: review.id, ...dbPayload });
    } else {
      await supabase.from("customer_reviews").insert(dbPayload);
    }
  } catch (e) {
    console.warn("Supabase save fallback to localStorage");
  }

  return newList;
}

/**
 * Elimina una reseña destacada por su ID.
 */
export async function removeFeaturedReview(id: number | string): Promise<FeaturedReview[]> {
  const currentList = getStoredFeaturedReviews();
  const newList = currentList.filter(r => String(r.id) !== String(id));
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newList));

  try {
    await supabase.from("customer_reviews").delete().eq("id", id);
  } catch (e) {
    console.warn("Supabase delete fallback to localStorage");
  }

  return newList;
}

/**
 * Convierte un archivo de imagen seleccionado por el usuario a Base64
 * para poder usar fotos reales de clientes subidas directamente desde la PC.
 */
export function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
