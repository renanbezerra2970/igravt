import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createEstablishment } from "@/lib/establishment";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name: string | undefined = body?.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Nome do estabelecimento é obrigatório" }, { status: 400 });
  }

  // Um usuário só pode ter um estabelecimento por enquanto.
  const { data: existing } = await supabaseAdmin
    .from("staff_members")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Você já tem um estabelecimento" }, { status: 409 });
  }

  const establishment = await createEstablishment(name);

  const { error: staffError } = await supabaseAdmin.from("staff_members").insert({
    establishment_id: establishment.id,
    user_id: user.id,
    role: "owner",
  });

  if (staffError) {
    return NextResponse.json({ error: staffError.message }, { status: 500 });
  }

  return NextResponse.json({ establishment });
}
