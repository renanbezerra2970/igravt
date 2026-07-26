import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getOrCreateDemoEstablishment, getOrCreateDemoRewards } from "@/lib/demo-establishment";

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

  const establishment = await getOrCreateDemoEstablishment();
  const rewards = await getOrCreateDemoRewards(establishment.id);

  if (rewards.length === 0) {
    return NextResponse.json({ error: "nenhuma recompensa configurada" }, { status: 500 });
  }

  const reward = rewards[Math.floor(Math.random() * rewards.length)];
  const couponCode = randomCouponCode();

  const { data, error } = await supabaseAdmin
    .from("roulette_spins")
    .insert({
      establishment_id: establishment.id,
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
