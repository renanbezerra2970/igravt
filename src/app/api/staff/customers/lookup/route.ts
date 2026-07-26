import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionEstablishment } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSessionEstablishment();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const whatsapp: string | undefined = body?.whatsapp?.trim();
  if (!whatsapp) {
    return NextResponse.json({ error: "whatsapp é obrigatório" }, { status: 400 });
  }

  // Client com sessão do usuário — RLS garante que só enxerga clientes do
  // próprio estabelecimento, mesmo que o filtro abaixo fosse esquecido.
  const supabase = await createSupabaseServerClient();
  const { data: customer, error } = await supabase
    .from("customers")
    .select("id, name, whatsapp_number, points_balance, visits_count, last_visit_at, birthday")
    .eq("establishment_id", session.establishmentId)
    .eq("whatsapp_number", whatsapp)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ customer, establishmentId: session.establishmentId });
}
