import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SessionEstablishment = {
  userId: string;
  email: string | null;
  establishmentId: string;
  establishmentName: string;
  establishmentSlug: string;
  role: "owner" | "manager" | "waiter";
};

// Resolve quem está logado e a que estabelecimento pertence, usando o
// client com sessão (respeita RLS) — não o service role.
export async function getSessionEstablishment(): Promise<SessionEstablishment | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("staff_members")
    .select("role, establishment:establishments(id, name, slug)")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data || !data.establishment) return null;

  const establishment = Array.isArray(data.establishment) ? data.establishment[0] : data.establishment;
  if (!establishment) return null;

  return {
    userId: user.id,
    email: user.email ?? null,
    establishmentId: establishment.id,
    establishmentName: establishment.name,
    establishmentSlug: establishment.slug,
    role: data.role as SessionEstablishment["role"],
  };
}
