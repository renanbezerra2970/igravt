import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

const ACTIVE_WINDOW_DAYS = 90;

export type DashboardSummary = {
  activeCustomers: number;
  inactiveCustomers: number;
  npsScore: number | null;
  npsResponseCount: number;
  npsTrend: { label: string; score: number | null }[];
  ranking: { name: string; totalCents: number }[];
  birthdaysThisMonth: { name: string; day: number }[];
  rouletteConversionPct: number | null;
  rouletteSpinCount: number;
};

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export async function getDashboardSummary(establishmentId: string): Promise<DashboardSummary> {
  const now = new Date();
  const activeCutoff = new Date(now.getTime() - ACTIVE_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const [customersRes, npsRes, consumptionRes, spinsRes] = await Promise.all([
    supabaseAdmin
      .from("customers")
      .select("id, name, birthday, last_visit_at")
      .eq("establishment_id", establishmentId),
    supabaseAdmin
      .from("nps_responses")
      .select("score, created_at")
      .eq("establishment_id", establishmentId)
      .order("created_at", { ascending: true }),
    supabaseAdmin
      .from("consumption_records")
      .select("customer_id, amount_cents")
      .eq("establishment_id", establishmentId),
    supabaseAdmin
      .from("roulette_spins")
      .select("id", { count: "exact", head: true })
      .eq("establishment_id", establishmentId),
  ]);

  const customers = customersRes.data ?? [];
  const npsResponses = npsRes.data ?? [];
  const consumptionRecords = consumptionRes.data ?? [];
  const rouletteSpinCount = spinsRes.count ?? 0;

  const activeCustomers = customers.filter(
    (c) => c.last_visit_at && new Date(c.last_visit_at) >= activeCutoff
  ).length;
  const inactiveCustomers = customers.length - activeCustomers;

  const npsScore = computeNps(npsResponses.map((r) => r.score));
  const npsTrend = computeMonthlyNpsTrend(npsResponses);

  const totalsByCustomer = new Map<string, number>();
  for (const rec of consumptionRecords) {
    totalsByCustomer.set(
      rec.customer_id,
      (totalsByCustomer.get(rec.customer_id) ?? 0) + rec.amount_cents
    );
  }
  const nameById = new Map(customers.map((c) => [c.id, c.name ?? "Cliente sem nome"]));
  const ranking = [...totalsByCustomer.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([customerId, totalCents]) => ({ name: nameById.get(customerId) ?? "Cliente", totalCents }));

  const currentMonth = now.getMonth();
  const birthdaysThisMonth = customers
    .filter((c) => c.birthday && new Date(c.birthday + "T00:00:00").getMonth() === currentMonth)
    .map((c) => ({
      name: c.name ?? "Cliente sem nome",
      day: new Date(c.birthday + "T00:00:00").getDate(),
    }))
    .sort((a, b) => a.day - b.day);

  const rouletteConversionPct =
    npsResponses.length > 0 ? Math.round((rouletteSpinCount / npsResponses.length) * 1000) / 10 : null;

  return {
    activeCustomers,
    inactiveCustomers,
    npsScore,
    npsResponseCount: npsResponses.length,
    npsTrend,
    ranking,
    birthdaysThisMonth,
    rouletteConversionPct,
    rouletteSpinCount,
  };
}

function computeNps(scores: number[]): number | null {
  if (scores.length === 0) return null;
  const promoters = scores.filter((s) => s >= 9).length;
  const detractors = scores.filter((s) => s <= 6).length;
  return Math.round(((promoters - detractors) / scores.length) * 100);
}

function computeMonthlyNpsTrend(
  responses: { score: number; created_at: string }[]
): { label: string; score: number | null }[] {
  const now = new Date();
  const buckets: { label: string; year: number; month: number; scores: number[] }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ label: MONTH_LABELS[d.getMonth()], year: d.getFullYear(), month: d.getMonth(), scores: [] });
  }

  for (const r of responses) {
    const d = new Date(r.created_at);
    const bucket = buckets.find((b) => b.year === d.getFullYear() && b.month === d.getMonth());
    if (bucket) bucket.scores.push(r.score);
  }

  return buckets.map((b) => ({ label: b.label, score: computeNps(b.scores) }));
}
