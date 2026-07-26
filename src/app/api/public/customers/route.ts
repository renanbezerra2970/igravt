import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getEstablishmentBySlug } from "@/lib/establishment";

// Cadastro público (sem login) — usado quando a jornada do cliente é
// aberta antes de qualquer lançamento de consumo pelo garçom.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const slug: string | undefined = body?.slug?.trim();
  const whatsapp: string | undefined = body?.whatsapp?.trim();
  const name: string | undefined = body?.name?.trim();

  if (!slug || !whatsapp) {
    return NextResponse.json({ error: "slug e whatsapp são obrigatórios" }, { status: 400 });
  }

  const establishment = await getEstablishmentBySlug(slug);
  if (!establishment) {
    return NextResponse.json({ error: "Estabelecimento não encontrado" }, { status: 404 });
  }

  const { data, error } = await supabaseAdmin
    .from("customers")
    .insert({
      establishment_id: establishment.id,
      whatsapp_number: whatsapp,
      name: name || null,
    })
    .select("id, name, whatsapp_number, points_balance, visits_count")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ customer: data });
}
