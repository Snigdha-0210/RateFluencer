/**
 * DB helpers for Reel persistence via Supabase REST API.
 * If Supabase is not configured the functions resolve silently.
 */
import { supabaseQuery, isSupabaseConfigured } from "@/lib/supabase";

export interface DBReel {
  id: string;
  title: string;
  script: object | null;
  linkedin_post: string | null;
  instagram_caption: string | null;
  trend_score: number | null;
  virality_score: number | null;
  audience: object | null;
  created_at?: string;
}

/**
 * Upsert a reel into the database.
 * Silently skips when Supabase is not configured.
 */
export async function saveReel(reel: DBReel): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { error } = await supabaseQuery("reels", "POST", reel);
  if (error) {
    console.warn("[DB] saveReel error:", error);
    return false;
  }
  return true;
}

/**
 * Fetch all reels, newest first.
 */
export async function getReels(): Promise<DBReel[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabaseQuery(
    "reels",
    "GET",
    undefined,
    "order=created_at.desc"
  );
  if (error) {
    console.warn("[DB] getReels error:", error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

/**
 * Fetch a single reel by id.
 */
export async function getReelById(id: string): Promise<DBReel | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabaseQuery(
    "reels",
    "GET",
    undefined,
    `id=eq.${encodeURIComponent(id)}&limit=1`
  );
  if (error || !Array.isArray(data) || data.length === 0) return null;
  return data[0];
}
