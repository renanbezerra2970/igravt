import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

const DEMO_SLUG = "sabor-arte";
const DEMO_NAME = "Restaurante Sabor & Arte";

const DEFAULT_REWARDS: { label: string; reward_type: "percent_off" | "free_item" }[] = [
  { label: "10% OFF", reward_type: "percent_off" },
  { label: "Sobremesa Grátis", reward_type: "free_item" },
  { label: "5% OFF", reward_type: "percent_off" },
  { label: "Bebida Grátis", reward_type: "free_item" },
  { label: "15% OFF", reward_type: "percent_off" },
  { label: "Brinde Surpresa", reward_type: "free_item" },
];

// Garante que existe um estabelecimento de demonstração para o protótipo
// funcionar sem exigir um passo extra de setup manual no banco.
export async function getOrCreateDemoEstablishment() {
  const { data: existing, error: findError } = await supabaseAdmin
    .from("establishments")
    .select("id, name, slug")
    .eq("slug", DEMO_SLUG)
    .maybeSingle();

  if (findError) throw findError;
  if (existing) return existing;

  const { data: created, error: createError } = await supabaseAdmin
    .from("establishments")
    .insert({ slug: DEMO_SLUG, name: DEMO_NAME, plan: "profissional" })
    .select("id, name, slug")
    .single();

  if (createError) throw createError;
  return created;
}

export async function getOrCreateDemoRewards(establishmentId: string) {
  const { data: existing, error: findError } = await supabaseAdmin
    .from("rewards")
    .select("id, label, reward_type")
    .eq("establishment_id", establishmentId)
    .eq("active", true);

  if (findError) throw findError;
  if (existing && existing.length > 0) return existing;

  const { data: created, error: createError } = await supabaseAdmin
    .from("rewards")
    .insert(
      DEFAULT_REWARDS.map((r) => ({
        establishment_id: establishmentId,
        label: r.label,
        reward_type: r.reward_type,
      }))
    )
    .select("id, label, reward_type");

  if (createError) throw createError;
  return created ?? [];
}
