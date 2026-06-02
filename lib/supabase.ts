/**
 * Supabase client — CreatorOS
 * Falls back gracefully if env vars are not configured.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

/**
 * Lightweight fetch wrapper that mirrors the Supabase REST API.
 * We avoid the @supabase/supabase-js SDK to keep the bundle lean.
 */
export async function supabaseQuery(
  table: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body?: object,
  queryParams?: string
): Promise<{ data: any; error: string | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: "Supabase not configured" };
  }

  const url = `${supabaseUrl}/rest/v1/${table}${queryParams ? `?${queryParams}` : ""}`;

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: method === "POST" ? "return=representation" : "",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return { data: null, error: data?.message ?? `HTTP ${res.status}` };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message ?? "Network error" };
  }
}
