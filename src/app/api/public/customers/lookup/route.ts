import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getEstablishmentBySlug } from "@/lib/establishment";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const slug: string | undefined = body?.slug?.trim();
  const whatsapp: string | undefined = body?.whatsapp?.trim();

  if (!slug || !whatsapp) {
    return NextResponse.json({ error: "slug e whatsapp são obrigatórios" }, { status: 400 });
  }

  const establishment = await getEstablishmentBySlug(slug);
  if (!establishment) {
    return NextResponse.json({ error: "Estabelecimento não encontrado" }, { status: 404 });
  }

  const { data: customer, error } = await supabaseAdmin
    .from("customers")
    .select("id, name, whatsapp_number, points_balance, visits_count")
    .eq("establishment_id", establishment.id)
    .eq("whatsapp_number", whatsapp)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ customer, establishment });
}
