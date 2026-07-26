import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getOrCreateDemoEstablishment } from "@/lib/demo-establishment";

// Cria o cliente sem exigir um lançamento de consumo — usado quando a
// jornada do cliente é aberta antes de qualquer visita registrada.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const whatsapp: string | undefined = body?.whatsapp?.trim();
  const name: string | undefined = body?.name?.trim();

  if (!whatsapp) {
    return NextResponse.json({ error: "whatsapp é obrigatório" }, { status: 400 });
  }

  const establishment = await getOrCreateDemoEstablishment();

  const { data, error } = await supabaseAdmin
    .from("customers")
    .insert({
      establishment_id: establishment.id,
      whatsapp_number: whatsapp,
      name: name || null,
    })
    .select("id, name, whatsapp_number, points_balance, visits_count, last_visit_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ customer: data });
}
