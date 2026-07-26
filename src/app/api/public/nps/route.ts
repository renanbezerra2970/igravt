import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const customerId: string | undefined = body?.customerId;
  const score: number | undefined = body?.score;
  const comment: string | undefined = body?.comment?.trim();
  const consumptionRecordId: string | undefined = body?.consumptionRecordId;

  if (!customerId || typeof score !== "number" || score < 0 || score > 10) {
    return NextResponse.json(
      { error: "customerId e score (0 a 10) são obrigatórios" },
      { status: 400 }
    );
  }

  const { data: customer, error: customerError } = await supabaseAdmin
    .from("customers")
    .select("establishment_id")
    .eq("id", customerId)
    .maybeSingle();

  if (customerError || !customer) {
    return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
  }

  const { data, error } = await supabaseAdmin
    .from("nps_responses")
    .insert({
      establishment_id: customer.establishment_id,
      customer_id: customerId,
      consumption_record_id: consumptionRecordId ?? null,
      score,
      comment: comment || null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ npsResponseId: data.id });
}
