import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getOrCreateDemoEstablishment } from "@/lib/demo-establishment";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const whatsapp = body?.whatsapp?.trim();

  if (!whatsapp) {
    return NextResponse.json({ error: "whatsapp é obrigatório" }, { status: 400 });
  }

  const establishment = await getOrCreateDemoEstablishment();

  const { data: customer, error } = await supabaseAdmin
    .from("customers")
    .select("id, name, whatsapp_number, points_balance, visits_count, last_visit_at, birthday")
    .eq("establishment_id", establishment.id)
    .eq("whatsapp_number", whatsapp)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ customer, establishmentId: establishment.id });
}
