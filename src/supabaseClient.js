import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://YOUR-PROJECT-REF.supabase.co"; // 🔑 Replace
const supabaseAnonKey = "YOUR-ANON-KEY"; // 🔑 Replace

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
