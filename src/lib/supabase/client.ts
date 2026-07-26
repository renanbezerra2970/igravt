import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local"
  );
}

// Client de navegador ciente de cookies (via @supabase/ssr) — mantém a
// sessão de autenticação sincronizada entre client e server components.
export const supabase = createBrowserClient(supabaseUrl ?? "", supabaseAnonKey ?? "");
