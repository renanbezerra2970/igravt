import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn(
    "Supabase admin não configurado: defina SUPABASE_SERVICE_ROLE_KEY em .env.local / nas variáveis da Vercel."
  );
}

// Cliente com privilégios de administrador — usado só em rotas de servidor
// (app/api/**), nunca importado por componentes de cliente. Ignora RLS,
// então cada rota é responsável por checar o que deveria ser permitido.
// Usa um placeholder não-vazio quando a chave ainda não existe: evita que a
// própria criação do client derrube o build antes de qualquer requisição
// real acontecer. Sem a chave de verdade, as chamadas falham em runtime
// (não no build) com um erro claro do Supabase.
export const supabaseAdmin = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  serviceRoleKey ?? "placeholder-service-role-key",
  { auth: { persistSession: false } }
);
