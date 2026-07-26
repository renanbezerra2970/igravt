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
  const name: string | undefined = body?.name?.trim();
  const amount: number | undefined = body?.amount;
  const note: string | undefined = body?.note?.trim();

  if (!whatsapp || typeof amount !== "number" || amount < 0) {
    return NextResponse.json(
      { error: "whatsapp e amount (número >= 0) são obrigatórios" },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const establishmentId = session.establishmentId;
  const pointsAwarded = Math.floor(amount);

  const { data: existing, error: findError } = await supabase
    .from("customers")
    .select("id, points_balance, visits_count")
    .eq("establishment_id", establishmentId)
    .eq("whatsapp_number", whatsapp)
    .maybeSingle();

  if (findError) {
    return NextResponse.json({ error: findError.message }, { status: 500 });
  }

  let customerId: string;
  let newBalance: number;
  let newVisits: number;

  if (existing) {
    customerId = existing.id;
    newBalance = existing.points_balance + pointsAwarded;
    newVisits = existing.visits_count + 1;

    const { error: updateError } = await supabase
      .from("customers")
      .update({
        points_balance: newBalance,
        visits_count: newVisits,
        last_visit_at: new Date().toISOString(),
        ...(name ? { name } : {}),
      })
      .eq("id", customerId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  } else {
    newBalance = pointsAwarded;
    newVisits = 1;

    const { data: created, error: createError } = await supabase
      .from("customers")
      .insert({
        establishment_id: establishmentId,
        whatsapp_number: whatsapp,
        name: name ?? null,
        points_balance: newBalance,
        visits_count: newVisits,
        last_visit_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }
    customerId = created.id;
  }

  const { data: record, error: recordError } = await supabase
    .from("consumption_records")
    .insert({
      establishment_id: establishmentId,
      customer_id: customerId,
      staff_user_id: session.userId,
      amount_cents: Math.round(amount * 100),
      points_awarded: pointsAwarded,
      note: note ?? null,
    })
    .select("id")
    .single();

  if (recordError) {
    return NextResponse.json({ error: recordError.message }, { status: 500 });
  }

  return NextResponse.json({
    consumptionRecordId: record.id,
    customerId,
    pointsAwarded,
    pointsBalance: newBalance,
    visitsCount: newVisits,
  });
}
