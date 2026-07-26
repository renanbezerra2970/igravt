import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getOrCreateDefaultRewards } from "@/lib/establishment";

function randomCouponCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "IGRAVT";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const customerId: string | undefined = body?.customerId;
  const npsResponseId: string | undefined = body?.npsResponseId;

  if (!customerId) {
    return NextResponse.json({ error: "customerId é obrigatório" }, { status: 400 });
  }

  const { data: customer, error: customerError } = await supabaseAdmin
    .from("customers")
    .select("establishment_id")
    .eq("id", customerId)
    .maybeSingle();

  if (customerError || !customer) {
    return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
  }

  const rewards = await getOrCreateDefaultRewards(customer.establishment_id);
  if (rewards.length === 0) {
    return NextResponse.json({ error: "nenhuma recompensa configurada" }, { status: 500 });
  }

  const reward = rewards[Math.floor(Math.random() * rewards.length)];
  const couponCode = randomCouponCode();

  const { data, error } = await supabaseAdmin
    .from("roulette_spins")
    .insert({
      establishment_id: customer.establishment_id,
      customer_id: customerId,
      nps_response_id: npsResponseId ?? null,
      reward_id: reward.id,
      coupon_code: couponCode,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    spinId: data.id,
    prizeLabel: reward.label,
    couponCode,
  });
}
