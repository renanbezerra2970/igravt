import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

const DEFAULT_REWARDS: { label: string; reward_type: "percent_off" | "free_item" }[] = [
  { label: "10% OFF", reward_type: "percent_off" },
  { label: "Sobremesa Grátis", reward_type: "free_item" },
  { label: "5% OFF", reward_type: "percent_off" },
  { label: "Bebida Grátis", reward_type: "free_item" },
  { label: "15% OFF", reward_type: "percent_off" },
  { label: "Brinde Surpresa", reward_type: "free_item" },
];

// Usado pelas rotas públicas (jornada do cliente, sem login): resolve o
// estabelecimento pelo slug informado no link. Não cria nada — se o slug
// não existe, é erro de verdade (não inventamos um estabelecimento fake).
export async function getEstablishmentBySlug(slug: string) {
  const { data, error } = await supabaseAdmin
    .from("establishments")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getOrCreateDefaultRewards(establishmentId: string) {
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

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Cria um estabelecimento novo de verdade (fluxo de onboarding). Garante um
// slug único adicionando sufixo numérico em caso de colisão.
export async function createEstablishment(name: string) {
  const base = slugify(name) || "estabelecimento";
  let slug = base;
  let attempt = 1;

  while (true) {
    const { data: existing } = await supabaseAdmin
      .from("establishments")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!existing) break;
    attempt += 1;
    slug = `${base}-${attempt}`;
  }

  const { data, error } = await supabaseAdmin
    .from("establishments")
    .insert({ slug, name, plan: "essencial" })
    .select("id, name, slug")
    .single();

  if (error) throw error;
  return data;
}
