import { Alert } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function fetchAlerts(category?: string): Promise<{ alerts: Alert[]; total: number }> {
  const params = new URLSearchParams();
  if (category && category !== "all") params.set("category", category);

  const url = `${SUPABASE_URL}/functions/v1/zabbix-alerts${params.size ? `?${params}` : ""}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error ?? `Request failed (${res.status})`);
  }

  const data = await res.json();

  if (data.error) throw new Error(data.error);
  if (!Array.isArray(data.alerts)) throw new Error("Invalid response from server");

  return data as { alerts: Alert[]; total: number };
}
