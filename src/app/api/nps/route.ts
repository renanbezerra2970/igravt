import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getOrCreateDemoEstablishment } from "@/lib/demo-establishment";

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

  const establishment = await getOrCreateDemoEstablishment();

  const { data, error } = await supabaseAdmin
    .from("nps_responses")
    .insert({
      establishment_id: establishment.id,
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
