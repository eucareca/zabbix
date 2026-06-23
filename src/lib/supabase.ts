import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Ticket = {
  id: string;
  ticket_number: string;
  alert_id: string;
  host: string;
  problem: string;
  severity: string;
  category: string;
  alert_time: string | null;
  description: string | null;
  created_at: string;
};
