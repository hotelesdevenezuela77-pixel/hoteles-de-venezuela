import { supabase } from "./supabase";

export interface QualifiedInfluencer {
  id: number;
  slug: string;
  name: string;
  handle: string;
  email: string;
  phone: string;
  whatsapp: string;
  avatar_url: string;
  banner_url: string;
  bio: string;
  destination_focus: string;
  fee_per_trip_usd: number;
  status: "pendiente_gmail" | "activo" | "pausado";
  claimed_by_user_id?: string;
  claimed_by_email?: string;
  profile_completed_by_influencer?: boolean;
  created_at: string;
  updated_at?: string;
}

export const QUALIFIED_INFLUENCERS_STORAGE_KEY = "hdv_qualified_influencers_registry_v1";

export function slugifyInfluencerName(input: string, fallbackId?: number): string {
  const clean = (input || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!clean || clean === "creador-oficial-hdv" || clean === "influencer-invitado") {
    return `creador-hdv-${fallbackId || Date.now().toString().slice(-5)}`;
  }
  return clean;
}

export function getQualifiedInfluencers(): QualifiedInfluencer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUALIFIED_INFLUENCERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Filtrar cualquier registro viejo de ejemplo con "aura croce" que no haya sido reclamado por un usuario real
    return parsed.filter((inf: QualifiedInfluencer) => {
      const isUnclaimedOldDemo =
        inf.name?.toLowerCase().includes("aura croce") &&
        !inf.profile_completed_by_influencer &&
        (!inf.claimed_by_user_id || inf.claimed_by_user_id === "aura_croce_user_id");
      return !isUnclaimedOldDemo;
    });
  } catch {
    return [];
  }
}

export function saveQualifiedInfluencers(list: QualifiedInfluencer[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(QUALIFIED_INFLUENCERS_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("hdv-qualified-influencers-updated"));
  } catch (e) {
    console.warn("Error saving qualified influencers:", e);
  }
}

export function createQualifiedInfluencer(data: Partial<QualifiedInfluencer>): QualifiedInfluencer {
  const existing = getQualifiedInfluencers();
  const id = data.id || Math.floor(90000 + Math.random() * 9999);
  const rawName = (data.name || "").trim() || "Influencer Invitado(a) HDV";
  const isGenericName =
    !data.name?.trim() ||
    rawName.toLowerCase().includes("invitado") ||
    rawName.toLowerCase().includes("pendiente");

  const slug = data.slug || slugifyInfluencerName(isGenericName ? "" : rawName, id);

  const newInfluencer: QualifiedInfluencer = {
    id,
    slug,
    name: rawName,
    handle: (data.handle || "").trim() || "@influencer_hdv",
    email: (data.email || "").trim(),
    phone: (data.phone || data.whatsapp || "").trim(),
    whatsapp: (data.whatsapp || data.phone || "").trim(),
    avatar_url:
      data.avatar_url ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    banner_url:
      data.banner_url ||
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
    bio:
      data.bio ||
      "Creador(a) de contenido audiovisual, expediciones turísticas, cobertura 4K con Drone y alianzas estratégicas con hoteles, posadas y marcas en Venezuela.",
    destination_focus: data.destination_focus || "Coberturas Nacionales (Venezuela)",
    fee_per_trip_usd: Number(data.fee_per_trip_usd) || 20.0,
    status: data.claimed_by_user_id ? "activo" : "pendiente_gmail",
    claimed_by_user_id: data.claimed_by_user_id,
    claimed_by_email: data.claimed_by_email,
    profile_completed_by_influencer: Boolean(data.profile_completed_by_influencer),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const updated = [newInfluencer, ...existing.filter((i) => i.id !== id && i.slug !== slug)];
  saveQualifiedInfluencers(updated);
  syncInfluencerToMockEstablishments(newInfluencer);
  return newInfluencer;
}

export function updateQualifiedInfluencer(
  idOrSlug: number | string,
  updates: Partial<QualifiedInfluencer>
): QualifiedInfluencer | null {
  const existing = getQualifiedInfluencers();
  let updatedRecord: QualifiedInfluencer | null = null;

  const next = existing.map((inf) => {
    const match =
      inf.id === Number(idOrSlug) ||
      inf.slug.toLowerCase() === String(idOrSlug).toLowerCase();
    if (!match) return inf;

    const mergedName = updates.name !== undefined ? updates.name.trim() : inf.name;
    const shouldUpdateSlug =
      updates.slug ||
      (updates.name &&
        updates.name.trim() &&
        !updates.name.toLowerCase().includes("invitado") &&
        inf.slug.startsWith("creador-hdv-"));

    const nextSlug = updates.slug
      ? updates.slug
      : shouldUpdateSlug
        ? slugifyInfluencerName(mergedName, inf.id)
        : inf.slug;

    updatedRecord = {
      ...inf,
      ...updates,
      name: mergedName || inf.name,
      slug: nextSlug,
      updated_at: new Date().toISOString(),
    };
    return updatedRecord;
  });

  if (updatedRecord) {
    saveQualifiedInfluencers(next);
    syncInfluencerToMockEstablishments(updatedRecord);
    syncInfluencerProfileStorage(updatedRecord);
  }
  return updatedRecord;
}

export function deleteQualifiedInfluencer(id: number): void {
  const existing = getQualifiedInfluencers();
  const target = existing.find((i) => i.id === id);
  const filtered = existing.filter((i) => i.id !== id);
  saveQualifiedInfluencers(filtered);

  if (typeof window !== "undefined") {
    try {
      const mockEsts = JSON.parse(localStorage.getItem("hdv_mock_establishments") || "[]");
      const nextMock = mockEsts.filter(
        (e: any) => e.id !== id && (!target || e.slug !== target.slug)
      );
      localStorage.setItem("hdv_mock_establishments", JSON.stringify(nextMock));
    } catch {}
  }
}

export function syncInfluencerToMockEstablishments(inf: QualifiedInfluencer): void {
  if (typeof window === "undefined") return;
  try {
    const localEstsKey = "hdv_mock_establishments";
    const existing: any[] = JSON.parse(localStorage.getItem(localEstsKey) || "[]");

    const estPayload = {
      id: inf.id,
      name: inf.name,
      slug: inf.slug,
      status: "approved",
      owner_user_id: inf.claimed_by_user_id || `pending_influencer_${inf.id}`,
      category_name: "Creadores de Contenido / Influencers",
      category_slug: "influencers",
      category_id: 991,
      destination_name: inf.destination_focus || "Venezuela",
      destination_slug: "los-roques",
      destination_id: 1,
      rating_avg: 5.0,
      review_count: 24,
      created_at: inf.created_at || new Date().toISOString(),
      address: inf.destination_focus || "Coberturas Nacionales, Venezuela",
      phone: inf.phone || inf.whatsapp || "",
      whatsapp: inf.whatsapp || inf.phone || "",
      email: inf.claimed_by_email || inf.email || "",
      website: inf.handle
        ? `https://instagram.com/${inf.handle.replace(/^@/, "")}`
        : "https://hotelesdevenezuela.com",
      primary_image: inf.avatar_url,
      description: inf.bio,
      membership_tier: "diamante",
      has_hdv_seal: true,
      has_reservations_enabled: true,
      services: JSON.stringify([
        "Cobertura 4K & Drone",
        "Reels & TikTok Virales",
        "Reseñas de Hoteles & Posadas",
        "Expediciones Guiadas",
        "Embajadora de Marca",
      ]),
      images: [inf.avatar_url, inf.banner_url].filter(Boolean),
    };

    const idx = existing.findIndex((e: any) => e.id === inf.id || e.slug === inf.slug);
    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...estPayload };
    } else {
      existing.unshift(estPayload);
    }
    localStorage.setItem(localEstsKey, JSON.stringify(existing));

    // Intentar sincronizar silenciosamente en Supabase si la tabla lo permite
    supabase
      .from("establishments")
      .upsert(
        [
          {
            id: inf.id,
            name: inf.name,
            slug: inf.slug,
            description: inf.bio,
            address: inf.destination_focus || "Venezuela",
            phone: inf.phone || inf.whatsapp || null,
            whatsapp: inf.whatsapp || inf.phone || null,
            email: inf.claimed_by_email || inf.email || null,
            primary_image: inf.avatar_url,
            status: "approved",
            owner_user_id: inf.claimed_by_user_id || null,
            has_reservations_enabled: true,
          },
        ],
        { onConflict: "id" }
      )
      .then(() => {});
  } catch (e) {
    console.warn("Error syncing influencer to mock establishments:", e);
  }
}

export function syncInfluencerProfileStorage(inf: QualifiedInfluencer): void {
  if (typeof window === "undefined") return;
  try {
    const profileKey = `hdv_creator_profile_info_${inf.id}`;
    const existingRaw = localStorage.getItem(profileKey);
    const existing = existingRaw ? JSON.parse(existingRaw) : {};
    const updated = {
      ...existing,
      name: inf.name,
      headline: existing.headline || "Creador(a) de Contenido & Expediciones Turísticas HDV",
      avatar_url: inf.avatar_url || existing.avatar_url,
      banner_url: inf.banner_url || existing.banner_url,
      bio: inf.bio || existing.bio,
      instagram: inf.handle || existing.instagram || "",
      phone: inf.whatsapp || inf.phone || existing.phone || "",
      location: inf.destination_focus || existing.location || "Venezuela",
    };
    localStorage.setItem(profileKey, JSON.stringify(updated));
  } catch {}
}

export function buildInfluencerInviteLink(inf: QualifiedInfluencer): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://hotelesdevenezuela.com";
  return `${origin}/mis-negocios?claim=${encodeURIComponent(inf.slug)}&influencer_id=${inf.id}&role=influencer`;
}

